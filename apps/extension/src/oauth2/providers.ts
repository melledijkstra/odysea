import manifest from '../../manifest.json' with { type: 'json' }
import { settingsStore } from '@/settings/index.svelte'
import {
  GoogleAuthConfig,
  SpotifyAuthConfig,
  GithubAuthConfig,
} from '@melledijkstra/auth'

export type OauthProvider = 'google' | 'spotify' | 'github'

export class GithubAuthProvider extends GithubAuthConfig {
  get clientId() {
    return settingsStore.apiKeys.github_client_id || ''
  }

  get clientSecret() {
    return settingsStore.apiKeys.github_client_secret || ''
  }

  scopes = ['repo']
}

export class GoogleAuthProvider extends GoogleAuthConfig {
  get clientId() {
    return settingsStore.apiKeys.google || ''
  }

  scopes = manifest.oauth2.scopes.filter(
    (scope) => !scope.includes('googlehealth')
  )
}

export class GoogleHealthAuthProvider extends GoogleAuthConfig {
  get clientId() {
    return settingsStore.apiKeys.google || ''
  }

  scopes = [
    'profile',
    'email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
  ]
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
