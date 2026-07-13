import type { AuthClient } from '@melledijkstra/auth'
import { Logger } from '@melledijkstra/toolbox'
import type { Device, PlaybackState, Playlist, Track } from '../definitions/spotify'
import { TokenBaseClient } from '../tokenbaseclient'

const BASE_URL = 'https://api.spotify.com/v1'

export class SpotifyApiClient extends TokenBaseClient {
  logger = new Logger('SpotifyApi')

  constructor(private authClient: AuthClient) {
    super(BASE_URL, () => this.authClient.getAuthToken())
  }

  async getPlaylistItems(playlistId: string): Promise<Track[]> {
    type Response = {
      items: Array<{
        track: Track
      }>
    }

    const response = await this.request<Response>(`/playlists/${playlistId}/tracks`)

    if (response) {
      return response.items.map(item => item.track)
    }

    return []
  }

  async transferPlaybackDevice(deviceId: string) {
    try {
      await this.request(`/me/player`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      })
      return true
    }
    catch (error) {
      this.logger.error('Failed to transfer playback device:', error)
      return false
    }
  }

  async availableDevices(): Promise<Device[] | undefined> {
    type Response = {
      devices: Device[]
    }

    const response = await this.request<Response>('/me/player/devices')

    if (response) {
      return response.devices
    }
  }

  async seekToPosition(position: number) {
    this.request(`/me/player/seek?position_ms=${position}`, {
      method: 'PUT',
    })
  }

  async toggleShuffle(state: boolean) {
    await this.request(`/me/player/shuffle?state=${state ? 'true' : 'false'}`, {
      method: 'PUT',
    })
  }

  async userPlaylists(): Promise<Array<Playlist>> {
    const response = await this.request<{ items: Array<Playlist> }>('/me/playlists')

    return response?.items ?? []
  }

  async startPlayback(contextUri?: string, offset?: number) {
    const body: Record<string, unknown> = {
      position_ms: 0,
    }

    if (contextUri) {
      body.context_uri = contextUri
    }

    if (offset) {
      body.offset = { position: offset }
    }

    await this.request('/me/player/play', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  }

  async getPlaybackState() {
    this.logger.log('Retrieving playback state from Spotify Web API')
    const response = await this.request<PlaybackState>('/me/player')

    if (response) {
      return response
    }

    return undefined
  }

  async toggleRepeatMode(repeatMode: string | number): Promise<void> {
    const mode = typeof repeatMode === 'number' ? repeatMode : (repeatMode === 'off' ? 'off' : 'context')

    await this.request(`/me/player/repeat?state=${mode}`, {
      method: 'PUT',
    })
  }

  async play(context_uri?: string) {
    const options: RequestInit = {
      method: 'PUT',
    }

    const body: Record<string, unknown> = {}

    if (context_uri?.startsWith('spotify:track')) {
      body.uris = [context_uri]
    }
    else {
      body.context_uri = context_uri
    }

    if (Object.keys(body).length > 0) {
      options.body = JSON.stringify(body)
    }

    await this.request('/me/player/play', options)
  }

  async pause() {
    await this.request('/me/player/pause', {
      method: 'PUT',
    })
  }

  async previousTrack() {
    await this.request('/me/player/previous', {
      method: 'POST',
    })
  }

  async nextTrack() {
    await this.request('/me/player/next', {
      method: 'POST',
    })
  }

  async seek(position_ms: number) {
    await this.request(`/me/player/seek?position_ms=${position_ms}`, {
      method: 'PUT',
    })
  }

  async setVolume(volume: number) {
    await this.request(`/me/player/volume?volume_percent=${volume}`, {
      method: 'PUT',
    })
  }
}
