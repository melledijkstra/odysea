declare module 'MusicPlayer' {
  type Artist = {
    id: string
    uri: string
    name: string
    type: 'artist'
  }

  type Track = {
    id: string
    uri: string
    title: string
    artist: Artist
    album: Album
    duration_ms: number // in milliseconds
    coverArtUrl?: string // optional
    type: 'track'
  }

  type Album = {
    id: string
    uri: string
    title: string
    artist?: Artist
    releaseDate?: string // ISO date string
    coverArtUrl?: string // optional
    type: 'album'
  }

  type Playlist = {
    id: string
    uri: string
    title: string
    description?: string // optional
    coverArtUrl?: string // optional
    trackCount?: number // optional
    type: 'playlist'
  }

  interface MusicPlayerInterface {
    state: {
      playback: PlaybackState
    }
    getPlaylistItems(playlist: Playlist): Promise<Track[]>
    playItem(item: Track | Playlist | Album): Promise<void> | void
    getPlaylists(): Promise<Playlist[]>
    play(mediaItem?: Track | Playlist | Album): Promise<void> | void
    pause(): Promise<void> | void
    next(): Promise<void> | void
    previous(): Promise<void> | void
    seek(position_ms: number): Promise<void> | void
    initialize?(): Promise<void>
    destroy?(): void
    setVolume(volume: number): Promise<void> | void
    getPlaybackState(): Promise<PlaybackState>
    activateDevice?(deviceId: string): Promise<void> | void
    switchRepeatMode?(repeatMode: number | string): Promise<void> | void
    toggleShuffle?(enabled?: boolean): Promise<void> | void
  }

  type PlaybackState = {
    currentItem?: Track
    isPlaying: boolean
    volume: number // 0-100
    position_ms: number // in milliseconds
    shuffle: boolean
    repeatMode?: number // 0, 1, 2
  }
}
