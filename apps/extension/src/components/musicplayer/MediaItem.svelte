<script lang="ts">
  import type { Track } from 'MusicPlayer'

  const { track }: { track: Track } = $props()
</script>

<div
  class="flex flex-row items-center py-1 px-2 hover:bg-zinc-800 cursor-pointer"
>
  <img
    class="size-10 aspect-square"
    src={track.coverArtUrl ?? '/icons/album-cover-placeholder.png'}
    alt="Track cover"
  />
  <div class="flex flex-col ml-2">
    <p>{track.title}</p>
    <p>{track.artist}</p>
  </div>
</div>
