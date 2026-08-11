import type {
  AnyMetric,
  CountdownMetric,
  CounterMetric,
  SleepMetric,
  WorldClockMetric,
} from './types'

const STORAGE_KEYS = {
  metrics: 'metrics',
} as const

export class Trackers {
  metrics = $state<AnyMetric[]>([])

  constructor() {
    this.loadMetrics()
  }

  get allMetrics() {
    return this.metrics
  }

  private loadMetrics() {
    const stored = localStorage.getItem(STORAGE_KEYS.metrics)
    try {
      if (stored) {
        this.metrics = JSON.parse(stored) as AnyMetric[]
      }
    } catch {
      this.metrics = []
      localStorage.removeItem(STORAGE_KEYS.metrics)
    }
  }

  private storeMetrics(metrics: AnyMetric[]) {
    localStorage.setItem(STORAGE_KEYS.metrics, JSON.stringify(metrics))
  }

  public setMetrics(metrics: AnyMetric[]) {
    this.metrics = metrics
    this.storeMetrics(metrics)
  }

  addCountdown(name: string, date: string, pinned: boolean) {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const countdownDate = new Date(date)
    const newCountdown: CountdownMetric = {
      id: crypto.randomUUID(),
      type: 'countdown',
      name,
      date: countdownDate.valueOf(),
      pinned,
    }
    this.setMetrics([...this.metrics, newCountdown])
  }

  addCounter(name: string, value: number, pinned: boolean) {
    const newCounter: CounterMetric = {
      id: crypto.randomUUID(),
      type: 'counter',
      name,
      value,
      pinned,
    }
    this.setMetrics([...this.metrics, newCounter])
  }

  addWorldClock(name: string, timeZone: string, pinned: boolean) {
    const newWorldClock: WorldClockMetric = {
      id: crypto.randomUUID(),
      type: 'worldClock',
      name,
      timeZone,
      pinned,
    }
    this.setMetrics([...this.metrics, newWorldClock])
  }

  setSleepEnabled(enabled: boolean) {
    const hasSleep = this.metrics.some((m) => m.type === 'sleep')
    if (enabled && !hasSleep) {
      const sleepMetric: SleepMetric = {
        id: 'sleep',
        type: 'sleep',
        pinned: true,
      }
      this.setMetrics([...this.metrics, sleepMetric])
    } else if (!enabled && hasSleep) {
      this.setMetrics(this.metrics.filter((m) => m.type !== 'sleep'))
    }
  }

  get sleepEnabled() {
    return this.metrics.some((m) => m.type === 'sleep')
  }

  deleteMetric(id: string) {
    this.setMetrics(this.metrics.filter((m) => m.id !== id))
  }

  updateMetric(id: string, payload: Partial<AnyMetric>) {
    const newMetrics = this.metrics.map((metric) => {
      if (metric.id === id) {
        return { ...metric, ...payload } as AnyMetric
      }
      return metric
    })
    this.setMetrics(newMetrics)
  }

  pinMetric(id: string, pinned: boolean) {
    this.updateMetric(id, { pinned })
  }
}

export const trackers = new Trackers()
