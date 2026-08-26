import { mdiMinus, mdiPlus } from '@mdi/js'
import { trackers } from '../state.svelte'
import {
  Tracker,
  type TrackerFactory,
  type TrackerAction,
} from '../tracker.svelte'
import type { CounterTracker } from '../types'

export class Counter extends Tracker implements CounterTracker {
  readonly type = 'counter'
  declare name: string
  value = $state(0)

  constructor(id: string, name: string, value: number, pinned?: boolean) {
    super(id, pinned, name)
    this.name = name
    this.value = value
  }

  override get actions(): TrackerAction[] {
    return [
      {
        id: 'decrement',
        icon: mdiMinus,
        ariaLabel: 'Decrement',
        onClick: () => {
          this.decrement()
          trackers.setMetrics(trackers.metrics)
        },
      },
      {
        id: 'increment',
        icon: mdiPlus,
        ariaLabel: 'Increment',
        onClick: () => {
          this.increment()
          trackers.setMetrics(trackers.metrics)
        },
      },
    ]
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
