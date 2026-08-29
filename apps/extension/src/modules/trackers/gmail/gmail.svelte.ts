import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { GmailTracker } from '../types'
import { WebLocalStorage } from '@melledijkstra/storage'
import { GMAIL_SCOPE } from '@/oauth2/scope-registry'
import { googleAuthClient } from '@/oauth2/clients'
import { GoogleGmailApiClient } from '@melledijkstra/api'
import { repeatEvery } from '@melledijkstra/toolbox'
import browser from 'webextension-polyfill'

const STORAGE_KEY = 'google::gmail_unread'

export class Gmail extends Tracker implements GmailTracker {
  readonly id = 'gmail' as const
  readonly type = 'gmail' as const
  declare name: string
  unread = $state<number | undefined>(undefined)
  authenticated = $state(false)

  private cache = new WebLocalStorage()
  private client = new GoogleGmailApiClient(googleAuthClient)
  private cancelUpdater?: () => void

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
    await this.checkAuth()

    // Listen for auth changes via storage
    if (browser.storage?.local?.onChanged) {
      browser.storage.local.onChanged.addListener(this.handleStorageChange)
    }

    if (this.authenticated) {
      this.fetchData()
    }

    this.cancelUpdater = repeatEvery(() => {
      if (this.authenticated) {
        this.fetchData()
      }
    }, 60 * 1000)
  }

  override destroy() {
    if (browser.storage?.local?.onChanged) {
      browser.storage.local.onChanged.removeListener(this.handleStorageChange)
    }
    this.cancelUpdater?.()
  }

  private handleStorageChange = async (
    changes: Record<string, browser.Storage.StorageChange>
  ) => {
    if (changes[googleAuthClient.storageKey]) {
      await this.checkAuth()
      if (this.authenticated) {
        this.fetchData()
      } else {
        this.unread = undefined
      }
    }
  }

  private async checkAuth() {
    const hasToken = await googleAuthClient.isAuthenticated()
    if (!hasToken) {
      this.authenticated = false
      return
    }
    const scopes = await googleAuthClient.getGrantedScopes()
    this.authenticated = scopes.includes(GMAIL_SCOPE)
  }

  async authenticate(): Promise<void> {
    const tokenData = await googleAuthClient.getAuthToken(true, [GMAIL_SCOPE])
    if (tokenData) {
      await this.checkAuth()
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
