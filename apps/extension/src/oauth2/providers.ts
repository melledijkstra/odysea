import type { AuthConfig, OauthProvider } from '@melledijkstra/auth'
import { settingsStore } from '@/settings/index.svelte'
export type { OauthProvider }

export const getGithubAuthConfig = (): AuthConfig => ({
  name: 'github',
  get clientId() {
    return settingsStore.apiKeys.github_client_id || ''
  },
  get clientSecret() {
    return settingsStore.apiKeys.github_client_secret || ''
  },
  scopes: ['repo'],
})

export const getGoogleAuthConfig = (): AuthConfig => ({
  name: 'google',
  redirectPath: 'google',
  get clientId() {
    return settingsStore.apiKeys.google_client_id || ''
  },
  get clientSecret() {
    return settingsStore.apiKeys.google_client_secret || ''
  },
  scopes: [
    'profile',
    'email',
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  extraParams: {
    include_granted_scopes: 'true',
    access_type: 'offline',
    prompt: 'consent',
  },
  skipServerRevoke: true,
})

export const getGoogleHealthAuthConfig = (): AuthConfig => ({
  // google health uses the same client id and secret as google, but with different scopes
  ...getGoogleAuthConfig(),
  get clientId() {
    return settingsStore.apiKeys.google_client_id || ''
  },
  get clientSecret() {
    return settingsStore.apiKeys.google_client_secret || ''
  },
  name: 'google-health',
  scopes: ['https://www.googleapis.com/auth/googlehealth.sleep.readonly'],
  extraParams: {
    include_granted_scopes: 'false',
    access_type: 'offline',
    prompt: 'consent',
  },
  skipServerRevoke: true,
})

export const getSpotifyAuthConfig = (): AuthConfig => ({
  name: 'spotify',
  get clientId() {
    return settingsStore.apiKeys.spotify || ''
  },
  scopes: [
    'streaming',
    'app-remote-control',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
  ],
})
