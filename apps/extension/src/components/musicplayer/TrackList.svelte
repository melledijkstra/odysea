<script lang="ts">
  import type { Track } from 'MusicPlayer'
  import { millisecondsToTime } from '@melledijkstra/toolbox'

  const {
    tracks,
    onTrackSelected,
  }: {
    tracks: Track[]
    onTrackSelected: (track: Track) => void
  } = $props()
</script>

{#snippet trackItem(track: Track)}
  <button
    class="flex flex-row w-full text-left items-center p-2 hover:bg-neutral-400 cursor-pointer rounded-sm transition text-white"
    onclick={() => onTrackSelected(track)}
  >
    <img
      class="size-10 aspect-square"
      src={track.coverArtUrl ?? '/icons/album-cover-placeholder.png'}
      alt="Track cover"
    />
    <div class="ml-2 overflow-hidden flex-1">
      <p class="truncate text-sm font-bold">{track.title}</p>
      <p class="truncate text-xs">{track.artist.name}</p>
    </div>
    <div class="ml-2 text-xs opacity-75">
      {millisecondsToTime(track.duration_ms)}
    </div>
  </button>
{/snippet}

{#if tracks.length}
  <ul>
    {#each tracks as track, index (track.id + index)}
      <li>
        {@render trackItem(track)}
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-sm text-center text-white">No tracks found</p>
{/if}
