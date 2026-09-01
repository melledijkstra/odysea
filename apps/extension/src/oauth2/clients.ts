import type { AuthClient } from '@melledijkstra/auth'
import {
  getGithubAuthConfig,
  getGoogleAuthConfig,
  getGoogleHealthAuthConfig,
  getSpotifyAuthConfig,
} from './providers'
import { ExtensionAuthClient } from '@melledijkstra/extension'

export const githubAuthClient = new ExtensionAuthClient(getGithubAuthConfig())
export const googleAuthClient = new ExtensionAuthClient(getGoogleAuthConfig())
export const spotifyAuthClient = new ExtensionAuthClient(getSpotifyAuthConfig())
export const googleHealthAuthClient = new ExtensionAuthClient(
  getGoogleHealthAuthConfig()
)

export const allAuthClients: AuthClient[] = [
  githubAuthClient,
  googleAuthClient,
  spotifyAuthClient,
  googleHealthAuthClient,
]
