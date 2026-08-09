import { AuthClient } from '@melledijkstra/extension'
import {
  getGithubAuthConfig,
  getGoogleAuthConfig,
  getSpotifyAuthConfig,
} from './providers'

export const githubAuthClient = new AuthClient(getGithubAuthConfig())
export const googleAuthClient = new AuthClient(getGoogleAuthConfig())
export const spotifyAuthClient = new AuthClient(getSpotifyAuthConfig())
