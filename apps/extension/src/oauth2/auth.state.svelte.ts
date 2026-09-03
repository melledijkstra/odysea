import {
  AuthClient,
  GoogleAuthClient,
  GithubAuthClient,
  SpotifyAuthClient,
  GoogleHealthAuthClient,
} from '@melledijkstra/auth'
import browser, { type Storage } from 'webextension-polyfill'
import { extensionAuth } from '@melledijkstra/extension'
import { settings, settingsStore } from '@/settings/index.svelte'
import { Logger } from '@/logger'

export type OAuthProvider = 'google' | 'spotify' | 'github' | 'google-health'

const logger = new Logger('AuthState')

export interface ProviderState {
  isAuthenticated: boolean
  scopes: string[]
}

export class AuthState {
  isInitialized = $state(false)
  providers = $state<Record<OAuthProvider, ProviderState>>({
    google: { isAuthenticated: false, scopes: [] },
    spotify: { isAuthenticated: false, scopes: [] },
    github: { isAuthenticated: false, scopes: [] },
    'google-health': { isAuthenticated: false, scopes: [] },
  })
  private _clients?: Record<OAuthProvider, AuthClient>
  private storageListenerBound = false

  get clients(): Record<OAuthProvider, AuthClient> {
    if (!this._clients) {
      return this.setupClients()
    }
    return this._clients
  }

  private setupClients() {
    logger.debug('Setting up auth clients')
    this._clients = {
      google: new GoogleAuthClient(
        {
          clientId: settingsStore.apiKeys.google_client_id ?? '',
          clientSecret: settingsStore.apiKeys.google_client_secret,
          initialScope: [
            'profile',
            'email',
            'openid',
            'https://www.googleapis.com/auth/userinfo.profile',
          ],
          extraParams: {
            include_granted_scopes: 'true',
          },
          skipServerRevoke: true,
        },
        extensionAuth({ redirectPath: 'google' })
      ),
      github: new GithubAuthClient(
        {
          clientId: settingsStore.apiKeys.github_client_id ?? '',
          clientSecret: settingsStore.apiKeys.github_client_secret,
          initialScope: ['repo'],
        },
        extensionAuth()
      ),
      spotify: new SpotifyAuthClient(
        {
          clientId: settingsStore.apiKeys.spotify ?? '',
          initialScope: [
            'streaming',
            'app-remote-control',
            'user-read-playback-state',
            'user-modify-playback-state',
            'playlist-read-private',
          ],
        },
        extensionAuth()
      ),
      'google-health': new GoogleHealthAuthClient(
        {
          clientId: settingsStore.apiKeys.google_client_id ?? '',
          clientSecret: settingsStore.apiKeys.google_client_secret,
          initialScope: [
            'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
          ],
          extraParams: {
            include_granted_scopes: 'false',
          },
          skipServerRevoke: true,
        },
        extensionAuth({ redirectPath: 'google' })
      ),
    }
    return this._clients
  }

  async initialize() {
    if (!settingsStore.loaded) {
      await settings.initialize()
    }

    this.setupClients()

    if (this.isInitialized) return

    this.setupStorageListener()
    await Promise.all(
      Object.values(this.clients).map(async (client) => {
        const isAuthenticated = await client.isAuthenticated()
        const grantedScopes = await client.getGrantedScopes()
        this.update(
          client.name as OAuthProvider,
          isAuthenticated,
          grantedScopes
        )
      })
    )
    this.isInitialized = true
  }

  private setupStorageListener() {
    if (this.storageListenerBound) return
    browser.storage.local.onChanged.addListener(this.handleStorageChange)
    this.storageListenerBound = true
  }

  private readonly handleStorageChange = async (
    changes: Storage.StorageAreaOnChangedChangesType
  ) => {
    for (const client of Object.values(this.clients)) {
      const provider = client.name as OAuthProvider
      const storageKey = client.storageKey
      if (changes[storageKey]) {
        const hasToken = !!changes[storageKey].newValue
        const isAuthenticated = hasToken && (await client.isAuthenticated())
        const scopes = isAuthenticated ? await client.getGrantedScopes() : []
        this.update(provider, isAuthenticated, scopes)
      }
    }
  }

  update(provider: OAuthProvider, isAuthenticated: boolean, scopes: string[]) {
    this.providers[provider].isAuthenticated = isAuthenticated
    this.providers[provider].scopes = scopes
  }

  deauthenticated(provider: OAuthProvider) {
    this.providers[provider].isAuthenticated = false
    this.providers[provider].scopes = []
  }

  hasScopes(provider: OAuthProvider, scopes: string[]) {
    return (
      this.providers[provider].isAuthenticated &&
      scopes.every((scope) => this.providers[provider].scopes.includes(scope))
    )
  }

  getGrantedScopes(provider: OAuthProvider) {
    return this.providers[provider].scopes
  }

  destroy() {
    if (this.storageListenerBound) {
      browser.storage.local.onChanged.removeListener(this.handleStorageChange)
      this.storageListenerBound = false
    }
  }
}

export const authState = new AuthState()
