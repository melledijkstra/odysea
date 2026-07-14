const playbackTrack: Spotify.Track = {
  id: '0iiB9CYptXO5Fz728LHHsQ',
  media_type: 'audio',
  track_type: 'audio',
  linked_from: {
    uri: null,
    id: null,
  },
  uid: '0iiB9CYptXO5Fz728LHHsQ',
  uri: 'spotify:track:0iiB9CYptXO5Fz728LHHsQ',
  type: 'track',
  name: 'Mahal',
  duration_ms: 201386,
  artists: [
    {
      name: 'Glass Beams',
      uri: 'spotify:artist:1LTFJvVvRw7ghAyThxYmnF',
      url: 'https://api.spotify.com/v1/artists/1LTFJvVvRw7ghAyThxYmnF',
    },
  ],
  album: {
    name: 'Mahal',
    uri: 'spotify:album:65vbRZn1cqkjyjMtlsbDGT',
    images: [
      {
        url: 'https://i.scdn.co/image/ab67616d0000b273b006f089af4d18d351f06c60',
        height: 640,
        width: 640,
      },
      {
        url: 'https://i.scdn.co/image/ab67616d00004851b006f089af4d18d351f06c60',
        height: 64,
        width: 64,
      },
      {
        url: 'https://i.scdn.co/image/ab67616d00001e02b006f089af4d18d351f06c60',
        height: 300,
        width: 300,
      },
    ],
  },
  is_playable: true,
}

export const playbackState: Spotify.PlaybackState = {
  context: {
    metadata: null,
    uri: null,
  },
  disallows: {},
  duration: 0,
  paused: false,
  position: 0,
  loading: false,
  timestamp: 0,
  repeat_mode: 0,
  shuffle: false,
  restrictions: {},
  track_window: {
    current_track: playbackTrack,
    next_tracks: [],
    previous_tracks: [],
  },
  playback_id: '',
  playback_quality: '',
  playback_features: {
    hifi_status: '',
  },
}
