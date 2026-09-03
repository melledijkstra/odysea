import type { OAuth2Client } from '@badgateway/oauth2-client'

export type AuthConfig = Omit<OAuth2Client['settings'], 'clientSecret'> & {
  clientSecret?: string | undefined
  initialScope?: string[] | undefined
  extraParams?: Record<string, string> | undefined
  skipServerRevoke?: boolean | undefined
}

export type ProviderDefinition = Pick<
  OAuth2Client['settings'],
  | 'server'
  | 'authorizationEndpoint'
  | 'tokenEndpoint'
  | 'revocationEndpoint'
  | 'discoveryEndpoint'
> & {
  extraParams?: Record<string, string>
  skipServerRevoke?: boolean
}

export function mergeAuthConfig(
  config: AuthConfig,
  defaults: ProviderDefinition
): AuthConfig {
  return {
    ...defaults,
    ...config,
    extraParams: {
      ...defaults.extraParams,
      ...config.extraParams,
    },
  }
}
