import SleepComponent from '@/components/trackers/Sleep.svelte'
import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { SleepTracker } from '../types'

export class Sleep extends Tracker implements SleepTracker {
  readonly id = 'sleep' as const
  readonly type = 'sleep' as const
  readonly component = SleepComponent
  declare name: string
  minutes = $state<number | undefined>(undefined)

  constructor(pinned: boolean = true, minutes?: number) {
    super('sleep', pinned, 'Sleep')
    this.name = 'Sleep'
    this.minutes = minutes
  }

  setMinutes(minutes?: number) {
    this.minutes = minutes
  }

  static formatSleepMinutes(minutes?: number): string {
    if (minutes === undefined || minutes < 0) {
      return 'No data'
    }

    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60

    if (remainingMins === 0) {
      return `${hours}h`
    }

    if (hours > 0) {
      return `${hours}h ${remainingMins}m`
    }

    return `${remainingMins}m`
  }

  formatValue(): string {
    return Sleep.formatSleepMinutes(this.minutes)
  }

  override toJSON(): SleepTracker {
    return {
      ...super.toJSON(),
      id: 'sleep',
      type: 'sleep',
    }
  }

  static fromDTO(dto: SleepTracker): Sleep {
    return new Sleep(dto.pinned)
  }
}

Sleep satisfies TrackerFactory<Sleep, SleepTracker>
