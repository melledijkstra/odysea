import { Google, GitHub, OAuth2Client, Spotify } from 'arctic'

export { Google, GitHub, OAuth2Client, Spotify }

export type ArcticClient = Google | GitHub | Spotify | OAuth2Client

export type OauthProvider = 'google' | 'spotify' | 'github'
export interface AuthConfig {
  name: OauthProvider
  scopes: string[]
  clientId: string
  clientSecret?: string
  authEndpoint?: string
  tokenEndpoint?: string
  extraParams?: Record<string, string>
  redirectPath?: string
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
