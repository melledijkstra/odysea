import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { GmailTracker } from '../types'
import { WebLocalStorage } from '@melledijkstra/storage'
import { GMAIL_SCOPE } from '@/oauth2/scope-registry'
import { authState } from '@/oauth2/auth.state.svelte'
import { GoogleGmailApiClient } from '@melledijkstra/api'
import { repeatEvery } from '@melledijkstra/toolbox'
import { untrack } from 'svelte'

const STORAGE_KEY = 'google::gmail_unread'

export class Gmail extends Tracker implements GmailTracker {
  readonly id = 'gmail' as const
  readonly type = 'gmail' as const
  declare name: string
  unread = $state<number | undefined>(undefined)

  get authenticated() {
    return authState.hasScopes('google', [GMAIL_SCOPE])
  }

  private cache = new WebLocalStorage()
  private client = new GoogleGmailApiClient(authState.clients.google)
  private cancelUpdater?: () => void
  private effectCleanup?: () => void

  constructor(pinned: boolean = true) {
    super('gmail', pinned, 'Gmail')
    this.name = 'Gmail'
    this.icon = '/icons/google-gmail.svg'
    this.init()
  }

  override onclick() {
    window.open('https://mail.google.com/mail', '_blank')
  }

  async init() {
    this.effectCleanup = $effect.root(() => {
      $effect(() => {
        if (this.authenticated) {
          untrack(() => {
            this.fetchData()
          })
        } else {
          this.unread = undefined
        }
      })
    })

    this.cancelUpdater = repeatEvery(() => {
      if (this.authenticated) {
        this.fetchData()
      }
    }, 60 * 1000)
  }

  override destroy() {
    this.effectCleanup?.()
    this.cancelUpdater?.()
  }

  async authenticate(): Promise<void> {
    const tokenData = await authState.clients.google.getAuthToken(true, [
      GMAIL_SCOPE,
    ])
    if (tokenData) {
      if (this.authenticated) {
        await this.fetchData()
      }
    }
  }

  override get needsAuth(): boolean {
    return !this.authenticated
  }

  async fetchData() {
    const cacheUnread = await this.cache.get<number>(STORAGE_KEY)
    if (cacheUnread !== undefined && cacheUnread !== null) {
      this.unread = cacheUnread
      return
    }

    try {
      this.unread = await this.client.getUnreadCount('INBOX')
      await this.cache.set(STORAGE_KEY, this.unread, 30 * 1000)
    } catch (error) {
      console.error('Error fetching Gmail data:', error)
    }
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
