import type { AuthConfig } from '@melledijkstra/auth'

export const getGithubAuthConfig = (
  clientId: string,
  clientSecret?: string
): AuthConfig => ({
  name: 'github',
  clientId,
  clientSecret,
  initialScope: ['repo'],
})

export const getGoogleAuthConfig = (
  clientId: string,
  clientSecret?: string
): AuthConfig => ({
  name: 'google',
  redirectPath: 'google',
  clientId,
  clientSecret,
  initialScope: [
    'profile',
    'email',
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  extraParams: {
    include_granted_scopes: 'true',
    access_type: 'offline',
    prompt: 'consent',
  },
  skipServerRevoke: true,
})

export const getGoogleHealthAuthConfig = (
  clientId: string,
  clientSecret?: string
): AuthConfig => ({
  ...getGoogleAuthConfig(clientId, clientSecret),
  name: 'google-health',
  initialScope: ['https://www.googleapis.com/auth/googlehealth.sleep.readonly'],
  extraParams: {
    include_granted_scopes: 'false',
    access_type: 'offline',
    prompt: 'consent',
  },
  skipServerRevoke: true,
})

export const getSpotifyAuthConfig = (clientId: string): AuthConfig => ({
  name: 'spotify',
  clientId,
  initialScope: [
    'streaming',
    'app-remote-control',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
  ],
})
