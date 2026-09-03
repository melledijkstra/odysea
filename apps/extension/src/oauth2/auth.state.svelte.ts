import type { OAuthProvider } from '@melledijkstra/auth'
import browser, { type Storage } from 'webextension-polyfill'
import { ExtensionAuthClient } from '@melledijkstra/extension'
import {
  getGithubAuthConfig,
  getGoogleAuthConfig,
  getGoogleHealthAuthConfig,
  getSpotifyAuthConfig,
} from './providers'
import { settings, settingsStore } from '@/settings/index.svelte'
import { Logger } from '@/logger'

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
  private _clients?: Record<OAuthProvider, ExtensionAuthClient>
  private storageListenerBound = false

  get clients(): Record<OAuthProvider, ExtensionAuthClient> {
    if (!this._clients) {
      return this.setupClients()
    }
    return this._clients
  }

  private setupClients() {
    logger.debug('Setting up auth clients')
    logger.debug('API Keys loaded:', settingsStore.loaded)
    logger.debug('API Keys:', settingsStore.apiKeys)
    this._clients = {
      google: new ExtensionAuthClient(
        getGoogleAuthConfig(
          settingsStore.apiKeys.google_client_id ?? '',
          settingsStore.apiKeys.google_client_secret
        )
      ),
      github: new ExtensionAuthClient(
        getGithubAuthConfig(
          settingsStore.apiKeys.github_client_id ?? '',
          settingsStore.apiKeys.github_client_secret
        )
      ),
      spotify: new ExtensionAuthClient(
        getSpotifyAuthConfig(settingsStore.apiKeys.spotify ?? '')
      ),
      'google-health': new ExtensionAuthClient(
        getGoogleHealthAuthConfig(
          settingsStore.apiKeys.google_client_id ?? '',
          settingsStore.apiKeys.google_client_secret
        )
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
        this.update(client.config.name, isAuthenticated, grantedScopes)
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
      const provider = client.config.name as OAuthProvider
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
