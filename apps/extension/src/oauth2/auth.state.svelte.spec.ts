import { describe, it, expect, vi, beforeEach } from 'vitest'
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
