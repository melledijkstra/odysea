import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ActiveTimeTriggerManager } from './active-time-trigger.js'
import type { Workflow } from './types/workflow.js'
import * as cp from 'node:child_process'

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

describe('ActiveTimeTriggerManager', () => {
  let manager: ActiveTimeTriggerManager
  let originalPlatform: NodeJS.Platform

  beforeEach(() => {
    vi.useFakeTimers()
    manager = new ActiveTimeTriggerManager()

    // Stub process.platform to darwin
    originalPlatform = process.platform
    Object.defineProperty(process, 'platform', { value: 'darwin' })
  })

  afterEach(() => {
    manager.stopAll()
    vi.useRealTimers()
    vi.clearAllMocks()
    Object.defineProperty(process, 'platform', { value: originalPlatform })
  })

  const mockExecSync = (idleSeconds: number, hasAssertion = false) => {
    vi.mocked(cp.execSync).mockImplementation((cmd) => {
      const command = cmd.toString()
      if (command.includes('ioreg')) return `${idleSeconds}\n`
      if (command.includes('pmset'))
        return hasAssertion
          ? 'PreventUserIdleDisplaySleep    1\n'
          : 'PreventUserIdleDisplaySleep    0\n'
      return ''
    })
  }

  const createWorkflow = (
    duration: number,
    idleLimit?: number,
    resetLimit?: number
  ): Workflow => ({
    id: 'test-wf',
    name: 'Test Workflow',
    trigger: {
      type: 'active_time',
      duration,
      ...(idleLimit !== undefined && { idleLimit }),
      ...(resetLimit !== undefined && { resetLimit }),
    },
    steps: [],
  })

  it('starts polling when a valid workflow is registered', () => {
    const onTick = vi.fn()
    manager.register(createWorkflow(60), onTick)

    expect(vi.getTimerCount()).toBeGreaterThan(0)
  })

  it('stops polling when all workflows are unregistered', () => {
    const onTick = vi.fn()
    const wf = createWorkflow(60)
    manager.register(wf, onTick)
    manager.unregister(wf.id)

    expect(vi.getTimerCount()).toBe(0)
  })

  it('triggers onTick when duration is reached', async () => {
    const onTick = vi.fn().mockResolvedValue(undefined)
    manager.register(createWorkflow(15), onTick)

    // Simulate active user (idle time 0s)
    mockExecSync(0)

    // Advance time by 10s (2 ticks of 5s)
    vi.advanceTimersByTime(10000)
    expect(onTick).not.toHaveBeenCalled()

    // Advance time by another 5s
    vi.advanceTimersByTime(5000)

    // Should trigger!
    expect(onTick).toHaveBeenCalledTimes(1)

    // It should reset after triggering, advancing 15s more triggers again
    vi.advanceTimersByTime(15000)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('pauses accumulation when user is idle (but not away)', () => {
    const onTick = vi.fn().mockResolvedValue(undefined)
    manager.register(createWorkflow(15, 60, 300), onTick)

    // Active for 10s
    mockExecSync(0)
    vi.advanceTimersByTime(10000)

    // User goes idle for 120 seconds (greater than 60s idleLimit, less than 300s resetLimit)
    mockExecSync(120)
    vi.advanceTimersByTime(10000) // 2 more ticks while idle

    // Should NOT trigger, because time was paused
    expect(onTick).not.toHaveBeenCalled()

    // User comes back
    mockExecSync(0)
    vi.advanceTimersByTime(5000)

    // Now it should trigger (10s before + 5s now)
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('resets accumulated time when user is away (exceeds resetLimit)', () => {
    const onTick = vi.fn().mockResolvedValue(undefined)
    manager.register(createWorkflow(15, 60, 300), onTick)

    // Active for 10s
    mockExecSync(0)
    vi.advanceTimersByTime(10000)

    // User goes away for 400 seconds (greater than 300s resetLimit)
    mockExecSync(400)
    vi.advanceTimersByTime(5000) // 1 tick to detect reset

    // User comes back
    mockExecSync(0)
    vi.advanceTimersByTime(10000)

    // Should NOT trigger yet, because previous 10s was reset. We only have 10s now.
    expect(onTick).not.toHaveBeenCalled()

    vi.advanceTimersByTime(5000)
    // Now it triggers (15s after reset)
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('treats user as active when pmset PreventUserIdleDisplaySleep assertion is active', () => {
    const onTick = vi.fn().mockResolvedValue(undefined)
    manager.register(createWorkflow(15, 60, 300), onTick)

    // User is physically idle for 100 seconds, but has an active media assertion
    mockExecSync(100, true)

    vi.advanceTimersByTime(15000) // 3 ticks of 5s

    // Should trigger, because idleSec was overridden to 0 by the assertion!
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('does not start polling on non-darwin platforms', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' })
    const onTick = vi.fn()
    manager.register(createWorkflow(60), onTick)

    expect(vi.getTimerCount()).toBe(0)
  })
})
