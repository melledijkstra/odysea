import type { Playlist } from 'SpotifyApi'

const generatePlaylist = (overrides: Partial<Playlist> = {}): Playlist => ({
  collaborative: false,
  description: '',
  external_urls: {
    spotify: 'https://open.spotify.com/playlist/64VMLRwsMyKeeP8G0F6XIM',
  },
  href: 'https://api.spotify.com/v1/playlists/64VMLRwsMyKeeP8G0F6XIM',
  id: '64VMLRwsMyKeeP8G0F6XIM',
  images: [
    {
      height: null,
      url: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84e472a8b309e090f7af3b24d3',
      width: null,
    },
  ],
  name: 'Test Playlist',
  owner: {
    display_name: 'John Doe',
    external_urls: {
      spotify: 'https://open.spotify.com/user/1187898094',
    },
    href: 'https://api.spotify.com/v1/users/1187898094',
    id: '1187898094',
    type: 'user',
    uri: 'spotify:user:1187898094',
  },
  primary_color: null,
  public: true,
  snapshot_id: 'AAAApVGadsFV09orZPYCCWFTsqN3hy2j',
  tracks: {
    href: 'https://api.spotify.com/v1/playlists/64VMLRwsMyKeeP8G0F6XIM/tracks',
    total: 114,
  },
  type: 'playlist',
  uri: 'spotify:playlist:64VMLRwsMyKeeP8G0F6XIM',
  ...overrides,
})

export const playlists: Playlist[] = [
  generatePlaylist({
    name: '#1 Test Playlist',
  }),
  generatePlaylist({
    name: '#2 Test Playlist',
  }),
  generatePlaylist({
    name: '#3 Test Playlist',
  }),
  generatePlaylist({
    name: '#4 Test Playlist',
  }),
]
