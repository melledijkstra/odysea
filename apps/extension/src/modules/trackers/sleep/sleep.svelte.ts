import { Tracker, type TrackerFactory } from '../tracker.svelte'
import type { SleepTracker } from '../types'
import { WebLocalStorage } from '@melledijkstra/storage'
import { SLEEP_SCOPE } from '@/oauth2/scope-registry'
import { authState } from '@/oauth2/auth.state.svelte'
import { GoogleHealthApiClient } from '@melledijkstra/api'
import { repeatEvery } from '@melledijkstra/toolbox'
import { untrack } from 'svelte'

const STORAGE_KEY = 'googlehealth::sleep_minutes'

export class Sleep extends Tracker implements SleepTracker {
  readonly id = 'sleep' as const
  readonly type = 'sleep' as const
  declare name: string
  minutes = $state<number | undefined>(undefined)

  get authenticated() {
    return authState.hasScopes('google-health', [SLEEP_SCOPE])
  }

  private cache = new WebLocalStorage()
  private client = new GoogleHealthApiClient(authState.clients['google-health'])
  private cancelUpdater?: () => void
  private effectCleanup?: () => void

  constructor(pinned: boolean = true, minutes?: number) {
    super('sleep', pinned, 'Sleep')
    this.name = 'Sleep'
    this.minutes = minutes
    this.icon = '/icons/google-health.svg'
    this.init()
  }

  async init() {
    this.effectCleanup = $effect.root(() => {
      $effect(() => {
        if (this.authenticated) {
          untrack(() => {
            this.fetchData()
          })
        } else {
          this.minutes = undefined
        }
      })
    })

    this.cancelUpdater = repeatEvery(
      () => {
        if (this.authenticated) {
          this.fetchData()
        }
      },
      60 * 60 * 1000
    )
  }

  override destroy() {
    this.effectCleanup?.()
    this.cancelUpdater?.()
  }

  async authenticate(): Promise<void> {
    const tokenData = await authState.clients['google-health'].getAuthToken(
      true,
      [SLEEP_SCOPE]
    )
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
    const cacheSleepMinutes = await this.cache.get<number>(STORAGE_KEY)
    if (cacheSleepMinutes !== undefined && cacheSleepMinutes !== null) {
      this.minutes = cacheSleepMinutes
      return
    }

    try {
      this.minutes = await this.client.getSleep()
      await this.cache.set(STORAGE_KEY, this.minutes, 60 * 60 * 1000)
    } catch (error) {
      console.error('Error fetching sleep data:', error)
    }
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
