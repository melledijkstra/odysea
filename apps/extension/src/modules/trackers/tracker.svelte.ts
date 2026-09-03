import type { BaseTracker } from './types'

export interface TrackerFactory<
  T extends Tracker = Tracker,
  D extends BaseTracker = BaseTracker,
> {
  fromDTO(dto: D): T
}

export interface TrackerAction {
  id: string
  icon: string
  ariaLabel?: string
  onClick: () => void
}

export abstract class Tracker implements BaseTracker {
  readonly id: string
  abstract readonly type: string
  name?: string
  pinned: boolean = $state(false)
  icon?: string

  /**
   * Optional click handler for the whole tracker component
   */
  onclick?(): void

  get actions(): TrackerAction[] {
    return []
  }

  get needsAuth(): boolean {
    return false
  }

  authenticate?(): Promise<void>
  destroy?(): void

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
