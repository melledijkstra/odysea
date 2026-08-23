import { calculateRemainingDays } from '@melledijkstra/toolbox'
import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { CountdownTracker } from '../types'

export class Countdown extends Tracker implements CountdownTracker {
  readonly type = 'countdown'
  declare name: string
  date = $state<number>(0)

  constructor(id: string, name: string, date: number, pinned?: boolean) {
    super(id, pinned, name)
    this.name = name
    this.date = date
  }

  get daysRemaining(): number {
    return calculateRemainingDays(this.date)
  }

  get isExpired(): boolean {
    return this.daysRemaining <= 0
  }

  setDate(date: number | string | Date) {
    if (typeof date === 'number') {
      this.date = date
    } else if (typeof date === 'string') {
      this.date = Date.parse(date)
    } else {
      this.date = date.valueOf()
    }
  }

  formatValue(): string {
    return `${this.daysRemaining}d`
  }

  override toJSON(): CountdownTracker {
    return {
      ...super.toJSON(),
      type: this.type,
      name: this.name,
      date: this.date,
    }
  }

  static fromDTO(dto: CountdownTracker): Countdown {
    return new Countdown(dto.id, dto.name, dto.date, dto.pinned)
  }
}

Countdown satisfies TrackerFactory<Countdown, CountdownTracker>
