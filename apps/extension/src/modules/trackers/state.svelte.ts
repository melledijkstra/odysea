
export type Counter = {
  id: string
  name: string
  value: number
  pinned: boolean
}

export type CountDown = {
  id: string
  name: string
  date: number
  pinned: boolean
}

export type WorldClock = {
  id: string
  name: string
  timeZone: string
  pinned: boolean
}

const STORAGE_KEYS = {
  counters: 'counters',
  countdowns: 'countdowns',
  worldClocks: 'worldClocks',
  metricOrder: 'metricOrder',
  sleepMetricEnabled: 'sleepMetricEnabled',
} as const

class Trackers {
  counters = $state<Counter[]>([])
  countdowns = $state<CountDown[]>([])
  worldClocks = $state<WorldClock[]>([])
  metricOrder = $state<string[]>([])
  sleepEnabled = $state<boolean>(false)

  constructor() {
    this.loadCounters()
    this.loadCountdowns()
    this.loadClocks()
    this.loadMetricOrder()
    this.loadSleepEnabled()
  }

  get allMetrics() {
    const sleepMetric = this.sleepEnabled ? [{ id: 'sleep', type: 'sleep' as const, pinned: true }] : []

    const combined = [
      ...this.countdowns.map(c => ({ ...c, type: 'countdown' as const })),
      ...this.worldClocks.map(c => ({ ...c, type: 'worldClock' as const })),
      ...this.counters.map(c => ({ ...c, type: 'counter' as const })),
      ...sleepMetric
    ]

    const order = this.metricOrder;
    return combined.sort((a, b) => {
      let indexA = order.indexOf(a.id);
      let indexB = order.indexOf(b.id);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });
  }

  private loadMetricOrder() {
    const stored = localStorage.getItem(STORAGE_KEYS.metricOrder)
    try {
      if (stored) {
        this.metricOrder = JSON.parse(stored)
      }
    } catch {
      this.metricOrder = []
    }
  }

  public setMetricOrder(order: string[]) {
    this.metricOrder = order
    localStorage.setItem(STORAGE_KEYS.metricOrder, JSON.stringify(order))
  }

  private loadSleepEnabled() {
    this.sleepEnabled = localStorage.getItem(STORAGE_KEYS.sleepMetricEnabled) === 'true'
  }

  public setSleepEnabled(enabled: boolean) {
    this.sleepEnabled = enabled
    localStorage.setItem(STORAGE_KEYS.sleepMetricEnabled, enabled.toString())
    if (enabled && !this.metricOrder.includes('sleep')) {
      this.setMetricOrder([...this.metricOrder, 'sleep'])
    }
  }

  private setCountdowns(countdowns: CountDown[]) {
    this.storeCountdowns(countdowns)
    this.countdowns = countdowns
  }

  public setCounters(counters: Counter[]) {
    this.storeCounters(counters)
    this.counters = counters
  }

  private setWorldClocks(worldClocks: WorldClock[]) {
    this.storeWorldClocks(worldClocks)
    this.worldClocks = worldClocks
  }

  private storeCountdowns(counters: CountDown[]) {
    localStorage.setItem(STORAGE_KEYS.countdowns, JSON.stringify(counters))
  }

  private storeCounters(counters: Counter[]) {
    localStorage.setItem(STORAGE_KEYS.counters, JSON.stringify(counters))
  }

  private storeWorldClocks(worldClocks: WorldClock[]) {
    localStorage.setItem(STORAGE_KEYS.worldClocks, JSON.stringify(worldClocks))
  }

  private loadCounters() {
    const stored = localStorage.getItem(STORAGE_KEYS.counters)
    try {
      if (stored) {
        let parsed = JSON.parse(stored) as Counter[]
        let modified = false
        parsed = parsed.map(p => {
          if (!p.id) {
            modified = true
            return { ...p, id: crypto.randomUUID() }
          }
          return p
        })
        this.counters = parsed
        if (modified) this.storeCounters(this.counters)
      }
    } catch {
      this.counters = []
      localStorage.removeItem(STORAGE_KEYS.counters)
    }
  }

  private loadCountdowns() {
    const stored = localStorage.getItem(STORAGE_KEYS.countdowns)
    try {
      if (stored) {
        let parsed = JSON.parse(stored) as CountDown[]
        let modified = false
        parsed = parsed.map(p => {
          if (!p.id) {
            modified = true
            return { ...p, id: crypto.randomUUID() }
          }
          return p
        })
        this.countdowns = parsed
        if (modified) this.storeCountdowns(this.countdowns)
      }
    } catch {
      this.countdowns = []
      localStorage.removeItem(STORAGE_KEYS.countdowns)
    }
  }

  private loadClocks() {
    const stored = localStorage.getItem(STORAGE_KEYS.worldClocks)
    try {
      if (stored) {
        let parsed = JSON.parse(stored) as WorldClock[]
        let modified = false
        parsed = parsed.map(p => {
          if (!p.id) {
            modified = true
            return { ...p, id: crypto.randomUUID() }
          }
          return p
        })
        this.worldClocks = parsed
        if (modified) this.storeWorldClocks(this.worldClocks)
      }
    } catch {
      this.worldClocks = []
      localStorage.removeItem(STORAGE_KEYS.worldClocks)
    }
  }

  addCountdown(name: string, date: string, pinned: boolean) {
    const countdownDate = new Date(date)
    const newCountdown: CountDown = {
      id: crypto.randomUUID(),
      name,
      date: countdownDate.valueOf(),
      pinned,
    }
    this.setCountdowns([...this.countdowns, newCountdown])
    this.setMetricOrder([...this.metricOrder, newCountdown.id])
  }

  addCounter(name: string, value: number, pinned: boolean) {
    const newCounter: Counter = { id: crypto.randomUUID(), name, value, pinned }
    this.setCounters([...this.counters, newCounter])
    this.setMetricOrder([...this.metricOrder, newCounter.id])
  }

  addWorldClock(name: string, timeZone: string, pinned: boolean) {
    const newWorldClock: WorldClock = { id: crypto.randomUUID(), name, timeZone, pinned }
    this.setWorldClocks([...this.worldClocks, newWorldClock])
    this.setMetricOrder([...this.metricOrder, newWorldClock.id])
  }

  deleteCounter(id: string) {
    const newCounters = this.counters.filter((c) => c.id !== id)
    this.setCounters(newCounters)
  }

  deleteCountdown(id: string) {
    const newCountdowns = this.countdowns.filter((c) => c.id !== id)
    this.setCountdowns(newCountdowns)
  }

  deleteWorldClock(id: string) {
    const newWorldClocks = this.worldClocks.filter((c) => c.id !== id)
    this.setWorldClocks(newWorldClocks)
  }

  pinWorldClock(id: string, pinned: boolean) {
    const newWorldClocks = this.worldClocks.map((clock) => {
      if (clock.id === id) {
        return { ...clock, pinned }
      }
      return clock
    })
    this.setWorldClocks(newWorldClocks)
  }
}

export const trackers = new Trackers()

export const getIsSleepMetricEnabled = () => {
  return trackers.sleepEnabled
}

export const setIsSleepMetricEnabled = (value: boolean) => {
  trackers.setSleepEnabled(value)
}
