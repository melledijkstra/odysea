import { AuthClient, type AuthEnvironmentOptions } from '../auth-client'
import {
  mergeAuthConfig,
  type AuthConfig,
  type ProviderDefinition,
} from '../config'

export const GITHUB_DEFAULTS: ProviderDefinition = {
  server: 'https://github.com',
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  skipServerRevoke: true,
}

export class GithubAuthClient extends AuthClient {
  constructor(config: AuthConfig, options: AuthEnvironmentOptions = {}) {
    super('github', mergeAuthConfig(config, GITHUB_DEFAULTS), options)
  }
}
