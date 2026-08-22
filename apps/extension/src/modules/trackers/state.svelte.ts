import { Countdown } from './countdown/countdown.svelte'
import { Counter } from './counter/counter.svelte'
import { Gmail } from './gmail/gmail.svelte'
import { Sleep } from './sleep/sleep.svelte'
import type { Tracker } from './tracker.svelte'
import type { AnyTracker } from './types'
import { WorldClock } from './worldclock/worldclock.svelte'

const STORAGE_KEYS = {
  metrics: 'metrics',
} as const

export class Trackers {
  metrics = $state<Tracker[]>([])

  constructor() {
    this.loadMetrics()
  }

  get allMetrics(): Tracker[] {
    return this.metrics
  }

  private loadMetrics() {
    const stored = localStorage.getItem(STORAGE_KEYS.metrics)
    try {
      if (stored) {
        const rawMetrics = JSON.parse(stored) as AnyTracker[]
        this.metrics = rawMetrics.map(this.toTracker)
      }
    } catch {
      this.metrics = []
      localStorage.removeItem(STORAGE_KEYS.metrics)
    }
  }

  private toTracker = (rawMetric: AnyTracker): Tracker => {
    switch (rawMetric.type) {
      case 'countdown':
        return Countdown.fromDTO(rawMetric)
      case 'counter':
        return Counter.fromDTO(rawMetric)
      case 'worldClock':
        return WorldClock.fromDTO(rawMetric)
      case 'sleep':
        return Sleep.fromDTO(rawMetric)
      case 'gmail':
        return Gmail.fromDTO(rawMetric)
      default: {
        const _exhaustive: never = rawMetric
        throw new Error(`Unknown tracker type: ${JSON.stringify(_exhaustive)}`)
      }
    }
  }

  private storeMetrics(metrics: Tracker[]) {
    localStorage.setItem(
      STORAGE_KEYS.metrics,
      JSON.stringify(metrics.map((m) => m.toJSON()))
    )
  }

  public setMetrics(metrics: Tracker[]) {
    this.metrics = metrics
    this.storeMetrics(metrics)
  }

  addCountdown(name: string, date: string, pinned: boolean) {
    const countdownDate = Date.parse(date)
    const newCountdown = new Countdown(
      crypto.randomUUID(),
      name,
      countdownDate,
      pinned
    )
    this.setMetrics([...this.metrics, newCountdown])
  }

  addCounter(name: string, value: number, pinned: boolean) {
    const newCounter = new Counter(crypto.randomUUID(), name, value, pinned)
    this.setMetrics([...this.metrics, newCounter])
  }

  addWorldClock(name: string, timeZone: string, pinned: boolean) {
    const newWorldClock = new WorldClock(
      crypto.randomUUID(),
      name,
      timeZone,
      pinned
    )
    this.setMetrics([...this.metrics, newWorldClock])
  }

  setSleepEnabled(enabled: boolean) {
    const hasSleep = this.metrics.some((m) => m.type === 'sleep')
    if (enabled && !hasSleep) {
      const sleepMetric = new Sleep(true)
      this.setMetrics([...this.metrics, sleepMetric])
    } else if (!enabled && hasSleep) {
      this.setMetrics(this.metrics.filter((m) => m.type !== 'sleep'))
    }
  }

  get sleepEnabled() {
    return this.metrics.some((m) => m.type === 'sleep')
  }

  setGmailEnabled(enabled: boolean) {
    const hasGmail = this.metrics.some((m) => m.type === 'gmail')
    if (enabled && !hasGmail) {
      const gmailMetric = new Gmail(true)
      this.setMetrics([...this.metrics, gmailMetric])
    } else if (!enabled && hasGmail) {
      this.setMetrics(this.metrics.filter((m) => m.type !== 'gmail'))
    }
  }

  get gmailEnabled() {
    return this.metrics.some((m) => m.type === 'gmail')
  }

  deleteMetric(id: string) {
    this.setMetrics(this.metrics.filter((m) => m.id !== id))
  }

  updateMetric(id: string, payload: Partial<AnyTracker>) {
    const newMetrics = this.metrics.map((metric) => {
      if (metric.id === id) {
        const dto = { ...metric.toJSON(), ...payload } as AnyTracker
        return this.toTracker(dto)
      }
      return metric
    })
    this.setMetrics(newMetrics)
  }

  pinMetric(id: string, pinned: boolean) {
    const metric = this.metrics.find((m) => m.id === id)
    if (metric) {
      metric.setPinned(pinned)
      this.storeMetrics(this.metrics)
    }
  }
}

export const trackers = new Trackers()
