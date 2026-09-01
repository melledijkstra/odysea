import type { AuthConfig } from '@melledijkstra/auth'
import { settingsStore } from '@/settings/index.svelte'

export const getGithubAuthConfig = (): AuthConfig => ({
  name: 'github',
  get clientId() {
    return settingsStore.apiKeys.github_client_id || ''
  },
  get clientSecret() {
    return settingsStore.apiKeys.github_client_secret || ''
  },
  initialScope: ['repo'],
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
  initialScope: [
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
  ...getGoogleAuthConfig(),
  // getters don't get copied when spreading, duplicated
  // TODO: find a better way to handle this
  get clientId() {
    return settingsStore.apiKeys.google_client_id || ''
  },
  get clientSecret() {
    return settingsStore.apiKeys.google_client_secret || ''
  },
  name: 'google-health',
  initialScope: ['https://www.googleapis.com/auth/googlehealth.sleep.readonly'],
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
  initialScope: [
    'streaming',
    'app-remote-control',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
  ],
})
