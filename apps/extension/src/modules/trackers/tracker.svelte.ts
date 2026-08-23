import type { BaseTracker } from './types'

export interface TrackerFactory<
  T extends Tracker = Tracker,
  D extends BaseTracker = BaseTracker,
> {
  fromDTO(dto: D): T
}

export abstract class Tracker implements BaseTracker {
  id: string
  abstract readonly type: string
  name?: string
  pinned: boolean = $state(false)

  constructor(id: string, pinned?: boolean, name?: string) {
    this.id = id
    if (typeof pinned === 'boolean') {
      this.pinned = pinned
    }
    this.name = name
  }

  togglePinned() {
    this.pinned = !this.pinned
  }

  setPinned(pinned: boolean) {
    this.pinned = pinned
  }

  abstract formatValue(): string

  toJSON(): BaseTracker {
    return {
      id: this.id,
      type: this.type,
      pinned: this.pinned,
      name: this.name,
    }
  }
}
