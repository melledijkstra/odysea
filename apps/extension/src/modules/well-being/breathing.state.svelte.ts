import { Timer, millisecondsToTime } from '@melledijkstra/toolbox'
import { settingsStore } from '@/settings/index.svelte'
import { resetTitle, setTitle } from '@/app-state.svelte'
import { Logger } from '@/logger'
import browser from 'webextension-polyfill'

export type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

export class BreathingState {
  private logger = new Logger('BreathingState')
  private timer: Timer

  active = $state(false)
  phase = $state<BreathingPhase>('inhale')
  remainingTime = $state(0)
  phaseSeconds = $state(0)

  // Derived phase helpers
  inhaling = $derived(this.phase === 'inhale')
  holdingIn = $derived(this.phase === 'hold-in')
  exhaling = $derived(this.phase === 'exhale')
  holdingOut = $derived(this.phase === 'hold-out')
  holding = $derived(this.phase === 'hold-in' || this.phase === 'hold-out')

  // Formatted time left
  timeLeft = $derived.by(() => {
    if (!this.active) {
      const durationMs =
        (settingsStore.breathing?.durationMinutes ?? 5) * 60 * 1000
      return millisecondsToTime(durationMs)
    }
    return millisecondsToTime(this.remainingTime)
  })

  // Phase display label
  phaseLabel = $derived.by(() => {
    switch (this.phase) {
      case 'inhale':
        return 'Inhale'
      case 'hold-in':
      case 'hold-out':
        return 'Hold'
      case 'exhale':
        return 'Exhale'
    }
  })

  // Current phase duration in seconds
  currentPhaseDuration = $derived.by(() => {
    const config = settingsStore.breathing
    if (!config) return 1
    switch (this.phase) {
      case 'inhale':
        return config.inhaleSeconds || 5
      case 'hold-in':
        return config.holdSeconds || 0
      case 'exhale':
        return config.exhaleSeconds || 7
      case 'hold-out':
        return config.holdOutSeconds || 0
    }
  })

  constructor() {
    const durationMs =
      (settingsStore.breathing?.durationMinutes ?? 5) * 60 * 1000
    this.timer = new Timer({
      duration: durationMs,
    })
    this.timer.on('tick', this.onTick)
    this.timer.on('complete', this.onComplete)
  }

  private onTick = (remainingTime: number) => {
    this.remainingTime = remainingTime
    this.phaseSeconds++

    this.logger.log('tick', {
      phase: this.phase,
      phaseSeconds: this.phaseSeconds,
      remainingTime,
    })

    const targetDuration = this.currentPhaseDuration
    if (this.phaseSeconds >= targetDuration) {
      this.nextPhase()
    } else {
      this.updateTitle()
    }
  }

  private nextPhase() {
    const config = settingsStore.breathing
    const holdSeconds = config?.holdSeconds ?? 0
    const holdOutSeconds = config?.holdOutSeconds ?? 0

    if (this.phase === 'inhale') {
      this.phase = holdSeconds > 0 ? 'hold-in' : 'exhale'
    } else if (this.phase === 'hold-in') {
      this.phase = 'exhale'
    } else if (this.phase === 'exhale') {
      this.phase = holdOutSeconds > 0 ? 'hold-out' : 'inhale'
    } else if (this.phase === 'hold-out') {
      this.phase = 'inhale'
    }

    this.phaseSeconds = 0
    this.playPhaseChime()
    this.updateTitle()
  }

  private updateTitle() {
    if (this.active) {
      setTitle(`${this.timeLeft} - ${this.phaseLabel}`)
    }
  }

  private playPhaseChime() {
    if (!settingsStore.breathing?.soundOn) return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const freq =
        this.phase === 'inhale' ? 440 : this.phase === 'exhale' ? 330 : 520
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.5)
    } catch (error) {
      // Audio context might be restricted before interaction or unsupported in test
      this.logger.warn('Audio context error', error)
    }
  }

  private playCompleteSound() {
    if (!settingsStore.breathing?.soundOn) return
    try {
      if (typeof Audio !== 'undefined') {
        const url = browser.runtime?.getURL
          ? browser.runtime.getURL('audio/happy-bell.wav')
          : '/audio/happy-bell.wav'
        const audio = new Audio(url)
        audio.play()
      }
    } catch (error) {
      this.logger.warn('Audio playback error', error)
    }
  }

  start() {
    const durationMs =
      (settingsStore.breathing?.durationMinutes ?? 5) * 60 * 1000
    this.timer.setDuration(durationMs)
    this.active = true
    this.phase = 'inhale'
    this.phaseSeconds = 0
    this.remainingTime = durationMs
    this.updateTitle()
    this.timer.start()
  }

  stop() {
    this.active = false
    this.phase = 'inhale'
    this.phaseSeconds = 0
    this.timer.stop()
    const durationMs =
      (settingsStore.breathing?.durationMinutes ?? 5) * 60 * 1000
    this.remainingTime = durationMs
    resetTitle()
  }

  toggle() {
    if (this.active) {
      this.stop()
    } else {
      this.start()
    }
  }

  private onComplete = () => {
    this.playCompleteSound()
    this.stop()
  }

  destroy() {
    this.timer.stop()
    resetTitle()
  }
}

export const breathingState = new BreathingState()
