export type Counter = {
  name: string
  value: number
  pinned: boolean
}

export type CountDown = {
  name: string
  date: number
  pinned: boolean
}

export type WorldClock = {
  name: string
  timeZone: string
  pinned: boolean
}

const STORAGE_KEYS = {
  counters: 'counters',
  countdowns: 'countdowns',
  worldClocks: 'worldClocks',
} as const

class Trackers {
  counters = $state<Counter[]>([])
  countdowns = $state<CountDown[]>([])
  worldClocks = $state<WorldClock[]>([])

  constructor() {
    this.loadCounters()
    this.loadCountdowns()
    this.loadClocks()
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
        this.counters = JSON.parse(stored) as Counter[]
      }
    }
    catch {
      this.counters = []
      localStorage.removeItem(STORAGE_KEYS.counters) // clear invalid data
    }
  }

  private loadCountdowns() {
    const stored = localStorage.getItem(STORAGE_KEYS.countdowns)
    try {
      if (stored) {
        this.countdowns = JSON.parse(stored) as CountDown[]
      }
    }
    catch {
      this.countdowns = []
      localStorage.removeItem(STORAGE_KEYS.countdowns) // clear invalid data
    }
  }

  private loadClocks() {
    const stored = localStorage.getItem(STORAGE_KEYS.worldClocks)
    try {
      if (stored) {
        this.worldClocks = JSON.parse(stored) as WorldClock[]
      }
    }
    catch {
      this.worldClocks = []
      localStorage.removeItem(STORAGE_KEYS.worldClocks) // clear invalid data
    }
  }

  addCountdown(name: string, date: string, pinned: boolean) {
    const countdownDate = new Date(date)
    const newCountdown: CountDown = { name, date: countdownDate.valueOf(), pinned }
    this.setCountdowns([
      ...this.countdowns,
      newCountdown,
    ])
  }

  addCounter(name: string, value: number, pinned: boolean) {
    const newCounter: Counter = { name, value, pinned }
    this.setCounters([
      ...this.counters,
      newCounter,
    ])
  }

  addWorldClock(name: string, timeZone: string, pinned: boolean) {
    const newWorldClock: WorldClock = { name, timeZone, pinned }
    this.setWorldClocks([
      ...this.worldClocks,
      newWorldClock,
    ])
  }

  deleteCounter(index: number) {
    const newCounters = this.counters.filter((_, i) => i !== index)
    this.setCounters(newCounters)
  }

  deleteCountdown(index: number) {
    const newCountdowns = this.countdowns.filter((_, i) => i !== index)
    this.setCountdowns(newCountdowns)
  }

  deleteWorldClock(index: number) {
    const newWorldClocks = this.worldClocks.filter((_, i) => i !== index)
    this.setWorldClocks(newWorldClocks)
  }

  pinWorldClock(index: number, pinned: boolean) {
    const newWorldClocks = this.worldClocks.map((clock, i) => {
      if (i === index) {
        return { ...clock, pinned }
      }
      return clock
    })
    this.setWorldClocks(newWorldClocks)
  }
}

export const trackers = new Trackers()

export const getIsSleepMetricEnabled = () => {
  return localStorage.getItem('sleepMetricEnabled') === 'true'
}

export const setIsSleepMetricEnabled = (value: boolean) => {
  localStorage.setItem('sleepMetricEnabled', value.toString())
}
