export interface BaseTracker {
  id: string
  type: string
  pinned: boolean
  name?: string
}

export interface CounterTracker extends BaseTracker {
  type: 'counter'
  name: string
  value: number
}

export interface CountdownTracker extends BaseTracker {
  type: 'countdown'
  name: string
  date: number
}

export interface WorldClockTracker extends BaseTracker {
  type: 'worldClock'
  name: string
  timeZone: string
}

export interface SleepTracker extends BaseTracker {
  type: 'sleep'
  id: 'sleep'
}

export type AnyTracker =
  CounterTracker | CountdownTracker | WorldClockTracker | SleepTracker
