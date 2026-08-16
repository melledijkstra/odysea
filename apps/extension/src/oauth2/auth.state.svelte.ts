import { getContext, setContext } from 'svelte'
import type { OauthProvider } from '@/oauth2/providers'
import { allAuthClients } from './clients'

export interface ProviderState {
  isAuthenticated: boolean
  scopes: string[]
}

export class AuthState {
  providers = $state<Record<OauthProvider, ProviderState>>({
    google: { isAuthenticated: false, scopes: [] },
    spotify: { isAuthenticated: false, scopes: [] },
    github: { isAuthenticated: false, scopes: [] },
    'google-health': { isAuthenticated: false, scopes: [] },
  })

  initialize() {
    Promise.all(
      allAuthClients.map(async (client) => {
        const isAuthenticated = await client.isAuthenticated()
        const grantedScopes = await client.getGrantedScopes()
        this.update(client.provider.name, isAuthenticated, grantedScopes)
      })
    )
  }

  update(provider: OauthProvider, isAuthenticated: boolean, scopes: string[]) {
    this.providers[provider] = { isAuthenticated, scopes }
  }

  deauthenticated(provider: OauthProvider) {
    this.providers[provider] = { isAuthenticated: false, scopes: [] }
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
}

const AUTH_CONTEXT_KEY = Symbol('auth')

export function setAuthContext(authState: AuthState) {
  setContext(AUTH_CONTEXT_KEY, authState)
}

export function getAuthContext(): AuthState {
  return getContext(AUTH_CONTEXT_KEY)
}
