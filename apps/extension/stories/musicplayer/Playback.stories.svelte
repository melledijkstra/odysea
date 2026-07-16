<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import SpotifyPlayback from '@/components/musicplayer/Playback.svelte'
  import { playbackState } from '@/fixtures/musicplayer/state'
  import { track_ClocksColdPlay, track_NocturneChopin } from '@/fixtures/musicplayer/tracks'

  const { Story } = defineMeta({
    title: 'Music Player/Playback',
    component: SpotifyPlayback,
    args: {
      playbackState,
    },
  })
</script>

<Story name="Default" />

<Story
  name="Clocks - Coldplay"
  args={{ playbackState: { ...playbackState, currentItem: track_ClocksColdPlay } }}
/>

<Story
  name="Nocturne - Chopin"
  args={{ playbackState: { ...playbackState, currentItem: track_NocturneChopin } }}
/>

<Story
  name="Paused"
  args={{ playbackState: { ...playbackState, isPlaying: false } }}
/>

<Story
  name="Shuffling"
  args={{ playbackState: { ...playbackState, shuffle: true } }}
/>
