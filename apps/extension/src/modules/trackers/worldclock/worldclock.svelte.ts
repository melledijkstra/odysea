import { repeatEvery } from '@melledijkstra/toolbox'
import { renderTimezone } from '@melledijkstra/toolbox'
import { onPageVisible } from '@/utils/visibility'
import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { WorldClockTracker } from '../types'

export class WorldClock extends Tracker implements WorldClockTracker {
  readonly type = 'worldClock'
  declare name: string
  timeZone = $state('')
  tick = $state(0)
  cancelUpdater?: () => void
  cancelVisibility?: () => void

  constructor(id: string, name: string, timeZone: string, pinned?: boolean) {
    super(id, pinned, name)
    this.name = name
    this.timeZone = timeZone

    this.cancelUpdater = repeatEvery(() => {
      this.tick++
    }, 60 * 1000) // every minute

    this.cancelVisibility = onPageVisible(() => {
      this.tick++
    })
  }

  override destroy() {
    this.cancelUpdater?.()
    this.cancelVisibility?.()
  }

  setTimeZone(timeZone: string) {
    this.timeZone = timeZone
  }

  formatValue(): string {
    // Read this.tick to trigger Svelte reactivity when it changes
    void this.tick
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
