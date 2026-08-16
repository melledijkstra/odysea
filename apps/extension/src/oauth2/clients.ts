import { AuthClient } from '@melledijkstra/extension'
import {
  getGithubAuthConfig,
  getGoogleAuthConfig,
  getGoogleHealthAuthConfig,
  getSpotifyAuthConfig,
} from './providers'

export const githubAuthClient = new AuthClient(getGithubAuthConfig())
export const googleAuthClient = new AuthClient(getGoogleAuthConfig())
export const spotifyAuthClient = new AuthClient(getSpotifyAuthConfig())
export const googleHealthAuthClient = new AuthClient(
  getGoogleHealthAuthConfig()
)

export const allAuthClients = [
  githubAuthClient,
  googleAuthClient,
  spotifyAuthClient,
  googleHealthAuthClient,
]
