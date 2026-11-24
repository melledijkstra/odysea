import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ActiveTimeTriggerManager,
  isSystemdIdleInhibited,
  parseDBusIdleSeconds,
  parseXprintidleSeconds,
} from './active-time-trigger.js'
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

  it('does not start polling on unsupported platforms', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' })
    const onTick = vi.fn()
    manager.register(createWorkflow(60), onTick)

    expect(vi.getTimerCount()).toBe(0)
  })

  describe('Linux support', () => {
    beforeEach(() => {
      Object.defineProperty(process, 'platform', { value: 'linux' })
    })

    it('parses D-Bus uint64, uint32, and xprintidle outputs into integer seconds', () => {
      expect(parseDBusIdleSeconds('(uint64 15432,)\n')).toBe(15)
      expect(parseDBusIdleSeconds('(uint32 60000,)')).toBe(60)
      expect(parseDBusIdleSeconds('(0,)')).toBe(0)
      expect(() => parseDBusIdleSeconds('invalid')).toThrow()

      expect(parseXprintidleSeconds('45999\n')).toBe(45)
      expect(() => parseXprintidleSeconds('not-a-number')).toThrow()
    })

    it('detects blocking idle inhibitors in systemd-inhibit output', () => {
      const nonIdleOutput = [
        'GNOME Shell       1000 melle 3300  gnome-shell     sleep             GNOME… delay',
        'melle             1000 melle 3473  gsd-power       handle-lid-switch Exte… block',
        'vlc               1000 melle 5678  vlc             idle              Play… delay',
      ].join('\n')
      expect(isSystemdIdleInhibited(nonIdleOutput)).toBe(false)

      const blockingIdleOutput = [
        'GNOME Shell       1000 melle 3300  gnome-shell     sleep             GNOME… delay',
        'firefox           1000 melle 4437  firefox         idle:sleep        Video block',
      ].join('\n')
      expect(isSystemdIdleInhibited(blockingIdleOutput)).toBe(true)
    })

    it('probes GNOME Mutter D-Bus first and caches it across polls', () => {
      const calls: string[] = []
      vi.mocked(cp.execSync).mockImplementation((cmd) => {
        const command = cmd.toString()
        calls.push(command)
        if (command.includes('org.gnome.Mutter.IdleMonitor')) {
          return '(uint64 0,)\n'
        }
        throw new Error('Unexpected command')
      })

      const onTick = vi.fn().mockResolvedValue(undefined)
      manager.register(createWorkflow(10), onTick)

      expect(vi.getTimerCount()).toBeGreaterThan(0)
      expect(calls).toHaveLength(1)
      expect(calls[0]).toContain('org.gnome.Mutter.IdleMonitor')

      vi.advanceTimersByTime(10000)
      expect(onTick).toHaveBeenCalledTimes(1)
      // 1 probe + 2 polls = 3 calls, all to Mutter without re-probing others
      expect(calls).toHaveLength(3)
      expect(
        calls.every((c) => c.includes('org.gnome.Mutter.IdleMonitor'))
      ).toBe(true)
    })

    it('falls back from GNOME Mutter to Freedesktop ScreenSaver D-Bus', () => {
      vi.mocked(cp.execSync).mockImplementation((cmd) => {
        const command = cmd.toString()
        if (command.includes('org.gnome.Mutter.IdleMonitor')) {
          throw new Error('org.gnome.Mutter.IdleMonitor not available')
        }
        if (command.includes('org.freedesktop.ScreenSaver')) {
          return '(uint32 2500,)\n'
        }
        throw new Error('Unexpected command')
      })

      const onTick = vi.fn().mockResolvedValue(undefined)
      manager.register(createWorkflow(10), onTick)

      expect(vi.getTimerCount()).toBeGreaterThan(0)
      vi.advanceTimersByTime(10000)
      expect(onTick).toHaveBeenCalledTimes(1)
    })

    it('falls back to xprintidle when both D-Bus backends fail', () => {
      vi.mocked(cp.execSync).mockImplementation((cmd) => {
        const command = cmd.toString()
        if (command.includes('gdbus')) {
          throw new Error('gdbus not available')
        }
        if (command.includes('xprintidle')) {
          return '3000\n'
        }
        throw new Error('Unexpected command')
      })

      const onTick = vi.fn().mockResolvedValue(undefined)
      manager.register(createWorkflow(10), onTick)

      expect(vi.getTimerCount()).toBeGreaterThan(0)
      vi.advanceTimersByTime(10000)
      expect(onTick).toHaveBeenCalledTimes(1)
    })

    it('treats user as active on Linux when org.gnome.SessionManager.IsInhibited returns true', () => {
      vi.mocked(cp.execSync).mockImplementation((cmd) => {
        const command = cmd.toString()
        if (command.includes('org.gnome.Mutter.IdleMonitor')) {
          return '(uint64 120000,)\n'
        }
        if (command.includes('org.gnome.SessionManager.IsInhibited')) {
          return '(true,)\n'
        }
        return ''
      })

      const onTick = vi.fn().mockResolvedValue(undefined)
      manager.register(createWorkflow(15, 60, 300), onTick)

      vi.advanceTimersByTime(15000)
      expect(onTick).toHaveBeenCalledTimes(1)
    })

    it('treats user as active on Linux when systemd-inhibit reports a blocking idle inhibitor', () => {
      vi.mocked(cp.execSync).mockImplementation((cmd) => {
        const command = cmd.toString()
        if (command.includes('org.gnome.Mutter.IdleMonitor')) {
          throw new Error('no mutter')
        }
        if (command.includes('org.freedesktop.ScreenSaver')) {
          return '(uint32 120000,)\n'
        }
        if (command.includes('org.gnome.SessionManager.IsInhibited')) {
          throw new Error('no gnome session manager')
        }
        if (command.includes('systemd-inhibit')) {
          return 'vlc 1000 user 999 vlc idle Watching video block\n'
        }
        return ''
      })

      const onTick = vi.fn().mockResolvedValue(undefined)
      manager.register(createWorkflow(15, 60, 300), onTick)

      vi.advanceTimersByTime(15000)
      expect(onTick).toHaveBeenCalledTimes(1)
    })

    it('skips polling and does not re-probe when no Linux backend is available', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.mocked(cp.execSync).mockImplementation(() => {
        throw new Error('command not found')
      })

      const onTick = vi.fn()
      manager.register(createWorkflow(60), onTick)
      const callsAfterFirstRegister = vi.mocked(cp.execSync).mock.calls.length

      expect(vi.getTimerCount()).toBe(0)
      expect(callsAfterFirstRegister).toBe(3)

      // Registering another workflow should not re-probe or start timers
      manager.register({ ...createWorkflow(30), id: 'test-wf-2' }, vi.fn())
      expect(vi.getTimerCount()).toBe(0)
      expect(vi.mocked(cp.execSync).mock.calls.length).toBe(
        callsAfterFirstRegister
      )

      warnSpy.mockRestore()
    })
  })
})
