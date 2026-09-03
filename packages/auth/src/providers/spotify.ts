import { AuthClient, type AuthEnvironmentOptions } from '../auth-client'
import {
  mergeAuthConfig,
  type AuthConfig,
  type ProviderDefinition,
} from '../config'

export const SPOTIFY_DEFAULTS: ProviderDefinition = {
  server: 'https://accounts.spotify.com',
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
}

export class SpotifyAuthClient extends AuthClient {
  constructor(config: AuthConfig, options: AuthEnvironmentOptions = {}) {
    super('spotify', mergeAuthConfig(config, SPOTIFY_DEFAULTS), options)
  }
}
