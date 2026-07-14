import type { Track } from 'MusicPlayer'
import { defaultArtist } from './artist'
import { convertSpotifyTrackToMPTrack } from '@/transforms/spotify'
import {
  tracks as spotify_tracks,
  track_ClocksColdPlay as spotify_clocks,
  track_NocturneChopin as spotify_nocturne_chopin,
} from '@/fixtures/spotify/tracks'

export const defaultTrack: Track = {
  id: 'default-track-id',
  title: 'Default Track Name',
  artist: defaultArtist,
  album: {
    id: 'default-album-id',
    title: 'Default Album Name',
    artist: defaultArtist,
    uri: '',
    type: 'album',
  },
  duration_ms: 180000,
  uri: '',
  type: 'track',
}

export const track_ClocksColdPlay: Track = convertSpotifyTrackToMPTrack(spotify_clocks)

export const track_NocturneChopin: Track = convertSpotifyTrackToMPTrack(spotify_nocturne_chopin)

export const tracks = spotify_tracks.map(convertSpotifyTrackToMPTrack)
