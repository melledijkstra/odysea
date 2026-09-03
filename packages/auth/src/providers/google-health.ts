import { AuthClient, type AuthEnvironmentOptions } from '../auth-client'
import {
  mergeAuthConfig,
  type AuthConfig,
  type ProviderDefinition,
} from '../config'

export const GOOGLE_HEALTH_DEFAULTS: ProviderDefinition = {
  server: 'https://oauth2.googleapis.com/',
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  extraParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
}

export class GoogleHealthAuthClient extends AuthClient {
  constructor(config: AuthConfig, options: AuthEnvironmentOptions = {}) {
    super(
      'google-health',
      mergeAuthConfig(config, GOOGLE_HEALTH_DEFAULTS),
      options
    )
  }
}
