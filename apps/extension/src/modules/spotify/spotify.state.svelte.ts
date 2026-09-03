import type { Device } from '@melledijkstra/api'

type SpotifyState = {
  token?: string
  devices: Device[] // List of available devices
  deviceId?: string // Device ID of Web SDK Player
  isPanelOpen: boolean
}

export const spotifyState = $state<SpotifyState>({
  devices: [],
  isPanelOpen: false,
})
