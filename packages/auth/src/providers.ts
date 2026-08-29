
import { AuthClient } from './auth-client'
import type { AuthFlowHandler } from './auth-client'
import type { IStorage } from '@melledijkstra/storage'

export type OauthProvider = 'google' | 'spotify' | 'github' | 'google-health'

export interface AuthConfig {
  name: OauthProvider
  scopes: string[]
  clientId: string
  clientSecret?: string | null
  authEndpoint?: string
  tokenEndpoint?: string
  discoveryEndpoint?: string
  extraParams?: Record<string, string>
  redirectPath?: string
  skipServerRevoke?: boolean
}

export class GoogleAuthClient extends AuthClient {
  constructor(
    config: AuthConfig,
    redirectUrl: string,
    options?: { storage?: IStorage; handler?: AuthFlowHandler }
  ) {
    super(
      {
        ...config,
        authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      },
      redirectUrl,
      options
    )
  }
}

export class GithubAuthClient extends AuthClient {
  constructor(
    config: AuthConfig,
    redirectUrl: string,
    options?: { storage?: IStorage; handler?: AuthFlowHandler }
  ) {
    super(
      {
        ...config,
        authEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
      },
      redirectUrl,
      options
    )
  }
}

export class SpotifyAuthClient extends AuthClient {
  constructor(
    config: AuthConfig,
    redirectUrl: string,
    options?: { storage?: IStorage; handler?: AuthFlowHandler }
  ) {
    super(
      {
        ...config,
        authEndpoint: 'https://accounts.spotify.com/authorize',
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
      },
      redirectUrl,
      options
    )
  }
}

export class GoogleHealthAuthClient extends GoogleAuthClient {
  constructor(
    config: AuthConfig,
    redirectUrl: string,
    options?: { storage?: IStorage; handler?: AuthFlowHandler }
  ) {
    super(config, redirectUrl, options)
  }
}

export const createGoogleAuthConfig = (): AuthConfig => ({
  name: 'google',
  scopes: ['openid', 'profile'],
  get clientId() {
    return process.env.GOOGLE_CLIENT_ID!
  },
  get clientSecret() {
    return process.env.GOOGLE_CLIENT_SECRET
  },
  extraParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
})

export const createGithubAuthConfig = (): AuthConfig => ({
  name: 'github',
  scopes: ['user'],
  get clientId() {
    return process.env.GITHUB_CLIENT_ID!
  },
  get clientSecret() {
    return process.env.GITHUB_CLIENT_SECRET
  },
})

export const createSpotifyAuthConfig = (): AuthConfig => ({
  name: 'spotify',
  scopes: ['user'],
  get clientId() {
    return process.env.SPOTIFY_CLIENT_ID!
  },
  get clientSecret() {
    return process.env.SPOTIFY_CLIENT_SECRET
  },
})
