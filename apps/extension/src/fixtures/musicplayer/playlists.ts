import { convertSpotifyPlaylist } from '@/transforms/spotify'
import { playlists as spotifyPlaylists } from '../spotify/playlists'
import type { Playlist } from 'MusicPlayer'

export const playlists: Playlist[] = [
  ...spotifyPlaylists.map(convertSpotifyPlaylist),
  {
    id: 'test-playlist-1',
    coverArtUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e472a8b309e090f7af3b24d3',
    title: 'Playlist 1',
    description: 'A collection of great tracks',
    uri: '',
    type: 'playlist',
  },
  {
    id: 'test-playlist-2',
    coverArtUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e472a8b309e090f7af3b24d3',
    title: 'Playlist 2',
    description: 'A collection of great tracks',
    uri: '',
    type: 'playlist',
  },
  {
    id: 'test-playlist-3',
    coverArtUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e472a8b309e090f7af3b24d3',
    title: 'Playlist 3',
    description: 'A collection of great tracks',
    uri: '',
    type: 'playlist',
  },
  {
    id: 'test-playlist-4',
    coverArtUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e472a8b309e090f7af3b24d3',
    title: 'Playlist 4',
    description: 'A collection of great tracks',
    uri: '',
    type: 'playlist',
  },
  {
    id: 'test-playlist-5',
    coverArtUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e472a8b309e090f7af3b24d3',
    title: 'Playlist 5',
    description: 'A collection of great tracks',
    uri: '',
    type: 'playlist',
  },
]
