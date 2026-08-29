import {
  GithubAuthClient,
  GoogleAuthClient,
  SpotifyAuthClient,
  GoogleHealthAuthClient,
  type AuthClient
} from '@melledijkstra/auth'
import {
  getGithubAuthConfig,
  getGoogleAuthConfig,
  getGoogleHealthAuthConfig,
  getSpotifyAuthConfig,
} from './providers'
import { ExtensionAuthFlowHandler } from '@melledijkstra/extension'
import { ExtensionStorage } from '@melledijkstra/extension'


export const githubAuthClient = new GithubAuthClient(
  getGithubAuthConfig(),
  chrome.identity.getRedirectURL('github'),
  {
    storage: new ExtensionStorage(),
    handler: new ExtensionAuthFlowHandler(),
  }
)
export const googleAuthClient = new GoogleAuthClient(
  getGoogleAuthConfig(),
  chrome.identity.getRedirectURL('google'),
  {
    storage: new ExtensionStorage(),
    handler: new ExtensionAuthFlowHandler(),
  }
)
export const spotifyAuthClient = new SpotifyAuthClient(
  getSpotifyAuthConfig(),
  chrome.identity.getRedirectURL(),
  {
    storage: new ExtensionStorage(),
    handler: new ExtensionAuthFlowHandler(),
  }
)
export const googleHealthAuthClient = new GoogleHealthAuthClient(
  getGoogleHealthAuthConfig(),
  chrome.identity.getRedirectURL('google'),
  {
    storage: new ExtensionStorage(),
    handler: new ExtensionAuthFlowHandler(),
  }
)

export const allAuthClients: AuthClient[] = [
  githubAuthClient,
  googleAuthClient,
  spotifyAuthClient,
  googleHealthAuthClient,
]
