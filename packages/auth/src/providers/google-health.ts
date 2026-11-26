import { AuthClient, type AuthEnvironmentOptions } from '../auth-client'
import {
  mergeAuthConfig,
  type AuthConfig,
  type ProviderDefinition,
} from '../config'
import { GOOGLE_DEFAULTS } from './google'

export const GOOGLE_HEALTH_DEFAULTS: ProviderDefinition = GOOGLE_DEFAULTS

export class GoogleHealthAuthClient extends AuthClient {
  constructor(config: AuthConfig, options: AuthEnvironmentOptions = {}) {
    super(
      'google-health',
      mergeAuthConfig(config, GOOGLE_HEALTH_DEFAULTS),
      options
    )
  }
}
