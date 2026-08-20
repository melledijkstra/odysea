import { getContext, setContext } from 'svelte'
import type { OauthProvider } from '@/oauth2/providers'
import { allAuthClients } from './clients'
import browser, { type Storage } from 'webextension-polyfill'

export interface ProviderState {
  isAuthenticated: boolean
  scopes: string[]
}

export class AuthState {
  isInitialized = $state(false)
  providers = $state<Record<OauthProvider, ProviderState>>({
    google: { isAuthenticated: false, scopes: [] },
    spotify: { isAuthenticated: false, scopes: [] },
    github: { isAuthenticated: false, scopes: [] },
    'google-health': { isAuthenticated: false, scopes: [] },
  })
  private storageListenerBound = false

  async initialize() {
    this.setupStorageListener()
    if (this.isInitialized) return
    await Promise.all(
      allAuthClients.map(async (client) => {
        const isAuthenticated = await client.isAuthenticated()
        const grantedScopes = await client.getGrantedScopes()
        this.update(client.provider.name, isAuthenticated, grantedScopes)
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
    for (const client of allAuthClients) {
      const provider = client.provider.name as OauthProvider
      const storageKey = client.storageKey
      if (changes[storageKey]) {
        const hasToken = !!changes[storageKey].newValue
        const isAuthenticated = hasToken && (await client.isAuthenticated())
        const scopes = isAuthenticated ? await client.getGrantedScopes() : []
        this.update(provider, isAuthenticated, scopes)
      }
    }
  }

  update(provider: OauthProvider, isAuthenticated: boolean, scopes: string[]) {
    this.providers[provider].isAuthenticated = isAuthenticated
    this.providers[provider].scopes = scopes
  }

  deauthenticated(provider: OauthProvider) {
    this.providers[provider].isAuthenticated = false
    this.providers[provider].scopes = []
  }

  hasScopes(provider: OauthProvider, scopes: string[]) {
    return (
      this.providers[provider].isAuthenticated &&
      scopes.every((scope) => this.providers[provider].scopes.includes(scope))
    )
  }

  getGrantedScopes(provider: OauthProvider) {
    return this.providers[provider].scopes
  }

  destroy() {
    if (this.storageListenerBound) {
      browser.storage.local.onChanged.removeListener(this.handleStorageChange)
      this.storageListenerBound = false
    }
  }
}

const AUTH_CONTEXT_KEY = Symbol('auth')

export function setAuthContext(authState: AuthState) {
  setContext(AUTH_CONTEXT_KEY, authState)
}

export function getAuthContext(): AuthState {
  return getContext(AUTH_CONTEXT_KEY)
}
