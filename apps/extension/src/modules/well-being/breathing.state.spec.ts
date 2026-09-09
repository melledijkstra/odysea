import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BreathingState } from './breathing.state.svelte'
import { settingsStore } from '@/settings/index.svelte'
import * as appState from '@/app-state.svelte'

describe('BreathingState', () => {
  let state: BreathingState
  let setTitleSpy: ReturnType<typeof vi.spyOn>
  let resetTitleSpy: ReturnType<typeof vi.spyOn>
  let audioPlaySpy: ReturnType<typeof vi.spyOn>
  let audioContextSpy: ReturnType<typeof vi.fn>

  class MockAudioContext {
    currentTime = 0
    destination = {}
    createOscillator = vi.fn(() => ({
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }))
    createGain = vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }))
  }

  beforeEach(() => {
    vi.useFakeTimers()
    setTitleSpy = vi.spyOn(appState, 'setTitle').mockImplementation(() => {})
    resetTitleSpy = vi
      .spyOn(appState, 'resetTitle')
      .mockImplementation(() => {})

    audioPlaySpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockImplementation(async () => {})

    audioContextSpy = vi.fn(function () {
      return new MockAudioContext()
    })
    vi.stubGlobal('AudioContext', audioContextSpy)

    settingsStore.breathing = {
      durationMinutes: 5,
      inhaleSeconds: 5,
      holdSeconds: 0,
      exhaleSeconds: 7,
      holdOutSeconds: 0,
      soundOn: true,
    }

    state = new BreathingState()
  })

  afterEach(() => {
    state.destroy()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('initializes with inactive state and default values', () => {
    expect(state.active).toBe(false)
    expect(state.phase).toBe('inhale')
    expect(state.phaseLabel).toBe('Inhale')
    expect(state.timeLeft).toBe('5:00')
    expect(state.inhaling).toBe(true)
    expect(state.exhaling).toBe(false)
  })

  it('starts exercise and updates active flag and title', () => {
    state.start()

    expect(state.active).toBe(true)
    expect(state.phase).toBe('inhale')
    expect(setTitleSpy).toHaveBeenCalledWith('5:00 - Inhale')
  })

  it('stops exercise and resets state and title', () => {
    state.start()
    state.stop()

    expect(state.active).toBe(false)
    expect(state.phase).toBe('inhale')
    expect(resetTitleSpy).toHaveBeenCalled()
  })

  it('toggles start and stop', () => {
    state.toggle()
    expect(state.active).toBe(true)

    state.toggle()
    expect(state.active).toBe(false)
  })

  it('transitions from inhale to exhale after inhaleSeconds', () => {
    state.start()

    // Advance 5 seconds (inhale duration)
    vi.advanceTimersByTime(5000)

    expect(state.phase).toBe('exhale')
    expect(state.phaseLabel).toBe('Exhale')
    expect(state.exhaling).toBe(true)
  })

  it('cycles from exhale back to inhale after exhaleSeconds', () => {
    state.start()

    // Inhale 5s
    vi.advanceTimersByTime(5000)
    expect(state.phase).toBe('exhale')

    // Exhale 7s
    vi.advanceTimersByTime(7000)
    expect(state.phase).toBe('inhale')
    expect(state.inhaling).toBe(true)
  })

  it('supports hold phases when configured', () => {
    settingsStore.breathing = {
      durationMinutes: 5,
      inhaleSeconds: 4,
      holdSeconds: 4,
      exhaleSeconds: 4,
      holdOutSeconds: 4,
      soundOn: true,
    }

    state.start()
    expect(state.phase).toBe('inhale')

    // Inhale 4s -> Hold in
    vi.advanceTimersByTime(4000)
    expect(state.phase).toBe('hold-in')
    expect(state.phaseLabel).toBe('Hold')
    expect(state.holding).toBe(true)

    // Hold in 4s -> Exhale
    vi.advanceTimersByTime(4000)
    expect(state.phase).toBe('exhale')
    expect(state.phaseLabel).toBe('Exhale')

    // Exhale 4s -> Hold out
    vi.advanceTimersByTime(4000)
    expect(state.phase).toBe('hold-out')
    expect(state.phaseLabel).toBe('Hold')
    expect(state.holding).toBe(true)

    // Hold out 4s -> Inhale
    vi.advanceTimersByTime(4000)
    expect(state.phase).toBe('inhale')
  })

  it('resets state and plays completion bell when duration completes', () => {
    settingsStore.breathing = {
      durationMinutes: 1, // 60s
      inhaleSeconds: 5,
      holdSeconds: 0,
      exhaleSeconds: 7,
      holdOutSeconds: 0,
      soundOn: true,
    }

    state.start()

    // Advance 60 seconds to finish
    vi.advanceTimersByTime(60000)

    expect(state.active).toBe(false)
    expect(resetTitleSpy).toHaveBeenCalled()
    expect(audioPlaySpy).toHaveBeenCalled()
  })

  it('plays phase chime on phase transition when soundOn is true', () => {
    state.start()
    expect(audioContextSpy).not.toHaveBeenCalled()

    // Inhale finishes (5s) -> phase transition to exhale
    vi.advanceTimersByTime(5000)

    expect(audioContextSpy).toHaveBeenCalled()
  })

  it('suppresses sounds when soundOn setting is false', () => {
    settingsStore.breathing.soundOn = false
    settingsStore.breathing.durationMinutes = 1

    state.start()

    // Trigger phase change (5s)
    vi.advanceTimersByTime(5000)
    expect(audioContextSpy).not.toHaveBeenCalled()

    // Complete entire exercise (remaining 55s)
    vi.advanceTimersByTime(55000)
    expect(audioPlaySpy).not.toHaveBeenCalled()
  })
})
