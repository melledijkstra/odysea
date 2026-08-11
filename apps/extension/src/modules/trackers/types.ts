export type BaseMetric = {
  id: string
  type: string
  pinned: boolean
}

export type CounterMetric = BaseMetric & {
  type: 'counter'
  name: string
  value: number
}
export type CountdownMetric = BaseMetric & {
  type: 'countdown'
  name: string
  date: number
}
export type WorldClockMetric = BaseMetric & {
  type: 'worldClock'
  name: string
  timeZone: string
}
export type SleepMetric = BaseMetric & {
  type: 'sleep'
  id: 'sleep'
}
export type AnyMetric =
  CounterMetric | CountdownMetric | WorldClockMetric | SleepMetric
