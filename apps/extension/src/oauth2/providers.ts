import manifest from '../../manifest.json' with { type: 'json' }
import { settingsStore } from '@/settings/index.svelte'
import { GoogleAuthConfig, SpotifyAuthConfig } from '@melledijkstra/auth'

export type OauthProvider = 'google' | 'spotify'

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
    'playlist-read-private',
  ]
}
