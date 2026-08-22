import GmailComponent from '@/components/trackers/Gmail.svelte'
import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { GmailTracker } from '../types'

export class Gmail extends Tracker implements GmailTracker {
  readonly id = 'gmail' as const
  readonly type = 'gmail' as const
  readonly component = GmailComponent
  declare name: string
  unread = $state<number | undefined>(undefined)

  constructor(pinned: boolean = true) {
    super('gmail', pinned, 'Gmail')
    this.name = 'Gmail'
  }

  setUnread(unread?: number) {
    this.unread = unread
  }

  formatValue(): string {
    if (this.unread === undefined || this.unread < 0) {
      return 'No data'
    }

    return `${this.unread} unread`
  }

  override toJSON(): GmailTracker {
    return {
      ...super.toJSON(),
      id: 'gmail',
      type: 'gmail',
    }
  }

  static fromDTO(dto: GmailTracker): Gmail {
    return new Gmail(dto.pinned)
  }
}

Gmail satisfies TrackerFactory<Gmail, GmailTracker>
