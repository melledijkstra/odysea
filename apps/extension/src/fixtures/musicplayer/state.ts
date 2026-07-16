import type { PlaybackState } from 'MusicPlayer'
import { defaultTrack } from './tracks'

export const playbackState: PlaybackState = {
  currentItem: defaultTrack,
  isPlaying: false,
  volume: 50, // 0-100
  position_ms: 0, // in milliseconds
  shuffle: false,
}
