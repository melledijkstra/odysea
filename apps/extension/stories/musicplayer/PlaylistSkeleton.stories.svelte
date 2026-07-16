<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import PlaylistSkeleton from '@/components/musicplayer/ListSkeleton.svelte'

  const { Story } = defineMeta({
    title: 'Music Player/Playlists',
    component: PlaylistSkeleton,
    args: {
      amount: 20,
    },
  })
</script>

<Story name="Loading" />
