import WorldClockComponent from '@/components/trackers/WorldClockTracker.svelte'
import { renderTimezone } from '@melledijkstra/toolbox'
import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { WorldClockTracker } from '../types'

export class WorldClock extends Tracker implements WorldClockTracker {
  readonly type = 'worldClock'
  readonly component = WorldClockComponent
  declare name: string
  timeZone = $state('')

  constructor(id: string, name: string, timeZone: string, pinned?: boolean) {
    super(id, pinned, name)
    this.name = name
    this.timeZone = timeZone
  }

  setTimeZone(timeZone: string) {
    this.timeZone = timeZone
  }

  formatValue(): string {
    return renderTimezone(this.timeZone)
  }

  override toJSON(): WorldClockTracker {
    return {
      ...super.toJSON(),
      type: this.type,
      name: this.name,
      timeZone: this.timeZone,
    }
  }

  static fromDTO(dto: WorldClockTracker): WorldClock {
    return new WorldClock(dto.id, dto.name, dto.timeZone, dto.pinned)
  }
}

WorldClock satisfies TrackerFactory<WorldClock, WorldClockTracker>
