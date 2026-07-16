import type { MusicPlayerState } from '@/components/musicplayer/state.svelte'
import { BaseMusicController } from '@/controllers/BaseMusicController'
import { playlists } from '@/fixtures/musicplayer/playlists'
import { tracks } from '@/fixtures/musicplayer/tracks'
import type { Album, PlaybackState, Playlist, Track } from 'MusicPlayer'

export class MockMusicPlayerController extends BaseMusicController {
  constructor(public state: MusicPlayerState) {
    super(state)
  }

  hasTabLockAcquired(): boolean {
    return true
  }

  async initialize(): Promise<void> {
    console.log('MockMusicPlayerController initialized')
  }

  async getPlaylistItems(): Promise<Track[]> {
    await this.delay(500)
    return tracks
  }

  async activateDevice?(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async playItem(item: Track | Playlist | Album): Promise<void> {
    if (item.type === 'track') {
      this.state.playback.currentItem = item
    }

    this.state.playback.position_ms = 0

    if (!this.state.playback.isPlaying) {
      this.state.playback.isPlaying = true
      this.setupPlaybackLoop()
    }
  }

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  async getPlaylists(): Promise<Playlist[]> {
    await this.delay(1000)
    return playlists
  }

  next(): void {
    throw new Error('Method not implemented.')
  }

  previous(): void {
    throw new Error('Method not implemented.')
  }

  async getPlaybackState(): Promise<PlaybackState> {
    return this.state.playback
  }

  async setVolume(volume: number): Promise<void> {
    this.state.playback.volume = Math.max(0, Math.min(100, volume)) // Ensure volume is between 0 and 100
  }

  async toggleShuffle(enabled?: boolean): Promise<void> {
    this.state.playback.shuffle = enabled ?? !this.state.playback.shuffle
  }

  async switchRepeatMode(repeatMode: number | string): Promise<void> {
    this.state.playback.repeatMode = typeof repeatMode === 'number' ? repeatMode : 0
  }
}
