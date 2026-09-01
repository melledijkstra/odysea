export type OAuthProvider = 'google' | 'spotify' | 'github' | 'google-health'

export interface ProviderDefinition {
  server: string
  authEndpoint?: string | undefined
  tokenEndpoint?: string | undefined
  revocationEndpoint?: string | undefined
  discoveryEndpoint?: string | undefined
  defaultScopes?: string[] | undefined
  extraParams?: Record<string, string> | undefined
  skipServerRevoke?: boolean | undefined
}

export const PROVIDER_DEFINITIONS: Record<OAuthProvider, ProviderDefinition> = {
  google: {
    server: 'https://oauth2.googleapis.com/',
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    defaultScopes: ['openid', 'profile'],
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  'google-health': {
    server: 'https://oauth2.googleapis.com/',
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    defaultScopes: [
      'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
    ],
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  github: {
    server: 'https://github.com',
    authEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    defaultScopes: ['user'],
    skipServerRevoke: true,
  },
  spotify: {
    server: 'https://accounts.spotify.com',
    authEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
    defaultScopes: ['user'],
  },
}

export interface AuthConfig {
  name: OAuthProvider
  clientId: string
  clientSecret?: string | undefined
  initialScope?: string[] | undefined
  redirectPath?: string | undefined
  extraParams?: Record<string, string> | undefined
  server?: string | undefined
  authEndpoint?: string | undefined
  tokenEndpoint?: string | undefined
  revocationEndpoint?: string | undefined
  discoveryEndpoint?: string | undefined
  skipServerRevoke?: boolean | undefined
}

export const createGoogleAuthConfig = (
  overrides?: Partial<AuthConfig> | undefined
): AuthConfig => ({
  name: 'google',
  get clientId() {
    return process.env['GOOGLE_CLIENT_ID'] ?? ''
  },
  get clientSecret() {
    return process.env['GOOGLE_CLIENT_SECRET']
  },
  initialScope: ['openid', 'profile'],
  extraParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
  ...overrides,
})

export const createGithubAuthConfig = (
  overrides?: Partial<AuthConfig> | undefined
): AuthConfig => ({
  name: 'github',
  get clientId() {
    return process.env['GITHUB_CLIENT_ID'] ?? ''
  },
  get clientSecret() {
    return process.env['GITHUB_CLIENT_SECRET']
  },
  initialScope: ['user'],
  ...overrides,
})

export const createSpotifyAuthConfig = (
  overrides?: Partial<AuthConfig> | undefined
): AuthConfig => ({
  name: 'spotify',
  get clientId() {
    return process.env['SPOTIFY_CLIENT_ID'] ?? ''
  },
  get clientSecret() {
    return process.env['SPOTIFY_CLIENT_SECRET']
  },
  initialScope: ['user'],
  ...overrides,
})
