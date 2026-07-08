import { Google, GitHub, OAuth2Client, Spotify } from 'arctic'

export type ArcticClient = Google | GitHub | Spotify | OAuth2Client

export type OauthProvider = 'google' | 'spotify' | 'fitbit' | 'github'

export abstract class AuthConfig {
  name: OauthProvider

  scopes: string[]
  authEndpoint?: string
  tokenEndpoint?: string
  extraParams?: Record<string, string>

  constructor(name: OauthProvider, scopes: string[]) {
    this.name = name
    this.scopes = scopes
  }

  abstract get clientId(): string
  abstract get clientSecret(): string | undefined
}

export class GoogleAuthConfig extends AuthConfig {
  constructor() {
    super('google', ['openid', 'profile'])
    this.extraParams = {
      access_type: 'offline',
      prompt: 'consent',
    }
  }

  get clientId(): string {
    return process.env.GOOGLE_CLIENT_ID!
  }

  get clientSecret(): string | undefined {
    return process.env.GOOGLE_CLIENT_SECRET!
  }
}

export class GithubAuthConfig extends AuthConfig {
  constructor() {
    super('github', ['user'])
  }

  get clientId(): string {
    return process.env.GITHUB_CLIENT_ID!
  }

  get clientSecret(): string | undefined {
    return process.env.GITHUB_CLIENT_SECRET!
  }
}

export class SpotifyAuthConfig extends AuthConfig {
  constructor() {
    super('spotify', ['user'])
  }

  get clientId(): string {
    return process.env.SPOTIFY_CLIENT_ID!
  }

  get clientSecret(): string | undefined {
    return process.env.SPOTIFY_CLIENT_SECRET!
  }
}

export class FitbitAuthConfig extends AuthConfig {
  constructor() {
    super('fitbit', ['activity', 'sleep'])
    this.authEndpoint = 'https://www.fitbit.com/oauth2/authorize'
    this.tokenEndpoint = 'https://api.fitbit.com/oauth2/token'
  }

  get clientId(): string {
    return process.env.FITBIT_CLIENT_ID!
  }

  get clientSecret(): string | undefined {
    return process.env.FITBIT_CLIENT_SECRET!
  }
}
