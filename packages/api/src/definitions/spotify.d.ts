export type Device = {
  id: string
  is_active: boolean
  is_private_session: boolean
  is_restricted: boolean
  name: string
  type: 'computer' | 'smartphone' | 'speaker'
  volume_percent: number // 0-100
  supports_volume: boolean
}

export type Image = {
  url: string
  height: number | null
  width: number | null
}

export type User = {
  display_name: string
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  uri: string
  type: 'user'
}

export type Playlist = {
  collaborative: boolean
  description: string
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  images: Array<Image>
  name: string
  owner: User
  primary_color: string | null
  public: boolean
  snapshot_id: string
  tracks: {
    href: string
    total: number
  }
  uri: string
  type: 'playlist'
}

export type Artist = {
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  name: string
  uri: string
  type: 'artist'
}

export type Track = {
  album: {
    album_type: 'album' | 'single' | 'compilation'
    total_tracks: number
    available_markets: string[]
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    images: Image[]
    name: string
    release_date: string
    release_date_precision: string
    restrictions?: {
      reason: string
    }
    is_playable?: boolean
    type: 'album'
    uri: string
    artists: Artist[]
  }
  artists: Artist[]
  available_markets: [
    string,
  ]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: {
    isrc?: string
    ean?: string
    upc?: string
  }
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  is_playable?: boolean
  restrictions?: {
    reason: string
  }
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  uri: string
  is_local: boolean
  type: 'track'
}

export type PlaybackState = {
  device: Device
  repeat_state: string
  shuffle_state: boolean
  context: {
    type: string
    href: string
    external_urls: {
      spotify: string
    }
    uri: string
  }
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: Track
  currently_playing_type: string
  actions: {
    interrupting_playback: boolean
    pausing: boolean
    resuming: boolean
    seeking: boolean
    skipping_next: boolean
    skipping_prev: boolean
    toggling_repeat_context: boolean
    toggling_shuffle: boolean
    toggling_repeat_track: boolean
    transferring_playback: boolean
  }
}
