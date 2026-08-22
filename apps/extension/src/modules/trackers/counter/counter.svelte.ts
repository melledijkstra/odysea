import CounterComponent from '@/components/trackers/Counter.svelte'
import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { CounterTracker } from '../types'

export class Counter extends Tracker implements CounterTracker {
  readonly type = 'counter'
  readonly component = CounterComponent
  declare name: string
  value = $state(0)

  constructor(id: string, name: string, value: number, pinned?: boolean) {
    super(id, pinned, name)
    this.name = name
    this.value = value
  }

  increment() {
    this.value++
  }

  decrement() {
    this.value--
  }

  reset() {
    this.value = 0
  }

  setValue(value: number) {
    this.value = value
  }

  formatValue(): string {
    return `${this.value}`
  }

  override toJSON(): CounterTracker {
    return {
      ...super.toJSON(),
      type: this.type,
      name: this.name,
      value: this.value,
    }
  }

  static fromDTO(dto: CounterTracker): Counter {
    return new Counter(dto.id, dto.name, dto.value, dto.pinned)
  }
}

Counter satisfies TrackerFactory<Counter, CounterTracker>
