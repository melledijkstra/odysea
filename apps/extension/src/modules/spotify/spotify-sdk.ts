import browser from 'webextension-polyfill'
import { Logger } from '@/logger'
import type { AuthClient } from '@melledijkstra/extension'

const logger = new Logger('SpotifySDK')

const SPOTIFY_SDK_FILE = 'spotify-sdk.min.js'

/**
 * Handles the loading of the Spotify SDK within the Chrome Extension
 */
function loadSpotifySDK(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    logger.log('Loading Spotify SDK')
    const sdkFile = browser.runtime.getURL(SPOTIFY_SDK_FILE)
    // check if the script is already loaded
    if (document.querySelector(`script[src="${sdkFile}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = sdkFile
    script.onload = () => {
      logger.log(`Spotify SDK loaded: %c${Spotify.Player.version}`, 'font-style: italic; color: lightgreen;')
      resolve()
    }
    script.onerror = () => {
      logger.error('Failed to load Spotify SDK', sdkFile, script)
      reject(new Error('Failed to load Spotify SDK'))
    }
    document.head.appendChild(script)
  })
}

function isSpotifySDKLoaded(): boolean {
  return window?.Spotify?.Player !== undefined
}

function createPlayer(authClient: AuthClient, initialVolume: number): Spotify.Player {
  return new window.Spotify.Player({
    name: 'Mizu Player',
    getOAuthToken: async (callback) => {
      const token = await authClient.getAuthToken()
      if (token) {
        callback(token)
      }
    },
    volume: initialVolume,
  })
}

export async function initializeSpotifyPlayer(
  authClient: AuthClient,
  initialVolume: number = 0.5
): Promise<Spotify.Player> {
  return new Promise((resolve, reject) => {
    try {
      if (isSpotifySDKLoaded()) {
        logger.log('Spotify SDK is already loaded, creating player')
        const player = createPlayer(authClient, initialVolume)
        resolve(player)
        return
      }
      
      window.onSpotifyWebPlaybackSDKReady = () => {
        logger.log('Spotify Web Playback SDK is ready, setting up player', { initialVolume })
        const player = createPlayer(authClient, initialVolume)
        resolve(player)
      }
      loadSpotifySDK()
    } catch (error) {
      reject(error)
    }
  })
}
