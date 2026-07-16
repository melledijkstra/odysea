<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import TrackList from '@/components/musicplayer/TrackList.svelte'
  import { tracks } from '@/fixtures/musicplayer/tracks'

  const { Story } = defineMeta({
    title: 'Music Player/Track List',
    component: TrackList,
    args: {
      tracks,
    },
  })
</script>

<Story name="Default" />

<Story
  name="Empty"
  args={{
    tracks: [],
  }}
/>
