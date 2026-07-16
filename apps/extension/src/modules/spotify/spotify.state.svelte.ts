import type { Device } from 'SpotifyApi'

type SpotifyState = {
  token?: string
  devices: Device[] // List of available devices
  deviceId?: string // Device ID of Web SDK Player
  isAuthenticated: boolean
}

export const spotifyState = $state<SpotifyState>({
  devices: [],
  isAuthenticated: false,
})
