import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extensionAuth } from '@melledijkstra/extension'
import { settingsStore } from '@/settings/index.svelte'
import { AuthState } from './auth.state.svelte'
import {
  GMAIL_SCOPE,
  TASKS_SCOPE,
  getAllGoogleServiceScopes,
} from './scope-registry'

vi.mock('@melledijkstra/extension')

describe('AuthState', () => {
  let state: AuthState

  beforeEach(() => {
    vi.clearAllMocks()
    settingsStore.apiKeys = {}
    state = new AuthState()
  })

  it('configures the Google client with granular consent and incremental scopes', () => {
    const googleClient = state.clients.google

    expect(googleClient.extraParams).toEqual(
      expect.objectContaining({
        include_granted_scopes: 'true',
        enable_granular_consent: 'true',
      })
    )
  })

  it('keeps Google initialScope minimal so incremental scope requests do not bundle unrelated services', () => {
    const googleClient = state.clients.google

    for (const serviceScope of getAllGoogleServiceScopes()) {
      expect(googleClient.initialScope).not.toContain(serviceScope)
    }
  })

  it('uses separate OAuth credentials and redirect paths for Google and Google Health', () => {
    settingsStore.apiKeys.google_client_id = 'google-main-id'
    settingsStore.apiKeys.google_client_secret = 'google-main-secret'
    settingsStore.apiKeys.google_health_client_id = 'google-health-id'
    settingsStore.apiKeys.google_health_client_secret = 'google-health-secret'

    const { google, 'google-health': googleHealth } = state.clients

    expect(google.config.clientId).toBe('google-main-id')
    expect(google.config.clientSecret).toBe('google-main-secret')
    expect(googleHealth.config.clientId).toBe('google-health-id')
    expect(googleHealth.config.clientSecret).toBe('google-health-secret')

    expect(extensionAuth).toHaveBeenCalledWith({ redirectPath: 'google' })
    expect(extensionAuth).toHaveBeenCalledWith({
      redirectPath: 'google-health',
    })
  })

  it('does not fall back to main Google credentials when Google Health credentials are unset', () => {
    settingsStore.apiKeys.google_client_id = 'google-main-id'
    settingsStore.apiKeys.google_client_secret = 'google-main-secret'

    const googleHealth = state.clients['google-health']

    expect(googleHealth.config.clientId).toBe('')
    expect(googleHealth.config.clientSecret).toBeUndefined()
  })

  it('enables server-side revocation for both Google and Google Health clients', () => {
    const { google, 'google-health': googleHealth } = state.clients

    expect(google.config.skipServerRevoke).toBeFalsy()
    expect(googleHealth.config.skipServerRevoke).toBeFalsy()
  })

  it('rebuilds clients with updated credentials when refreshClients is called', () => {
    expect(state.clients['google-health'].config.clientId).toBe('')

    settingsStore.apiKeys.google_health_client_id = 'updated-health-id'
    settingsStore.apiKeys.google_health_client_secret = 'updated-health-secret'
    state.refreshClients()

    expect(state.clients['google-health'].config.clientId).toBe(
      'updated-health-id'
    )
    expect(state.clients['google-health'].config.clientSecret).toBe(
      'updated-health-secret'
    )
  })

  it('tracks partial grants from granular consent accurately', () => {
    state.update('google', true, [
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      TASKS_SCOPE,
    ])

    expect(state.hasScopes('google', [TASKS_SCOPE])).toBe(true)
    expect(state.hasScopes('google', [GMAIL_SCOPE])).toBe(false)
    expect(state.hasScopes('google', [TASKS_SCOPE, GMAIL_SCOPE])).toBe(false)
  })
})
