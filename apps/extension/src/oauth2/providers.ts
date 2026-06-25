import manifest from '../../manifest.json' with { type: 'json' }
import { settingsStore } from '@/settings/index.svelte'
import { GoogleAuthConfig, SpotifyAuthConfig, FitbitAuthConfig } from '@melledijkstra/auth'
export type { OauthProvider } from '@melledijkstra/auth'

export class GoogleAuthProvider extends GoogleAuthConfig {
  get clientId() {
    return settingsStore.apiKeys.google || ''
  }
  scopes = manifest.oauth2.scopes
}

export class SpotifyAuthProvider extends SpotifyAuthConfig {
  get clientId() {
    return settingsStore.apiKeys.spotify || ''
  }
  scopes = [
    'streaming',
    'app-remote-control',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private'
  ]
}

export class FitbitAuthProvider extends FitbitAuthConfig {
  get clientId() {
    return settingsStore.apiKeys.fitbit || ''
  }
  scopes = ['sleep', 'activity']
}
