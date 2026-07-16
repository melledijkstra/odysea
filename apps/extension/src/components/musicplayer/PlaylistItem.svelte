<script lang="ts">
  import type { Playlist } from 'MusicPlayer'

  const {
    playlist,
    onPlaylistPlay,
    onPlaylistSelected,
  }: {
    playlist: Playlist
    onPlaylistPlay: (playlist: Playlist) => void
    onPlaylistSelected: (playlist: Playlist) => void
  } = $props()
</script>

<div
  class="flex flex-row gap-2 w-full items-center p-2 hover:bg-neutral-400 rounded-sm transition text-white"
>
  <button
    class="cursor-pointer hover:opacity-30 shrink-0"
    onclick={() => onPlaylistPlay(playlist)}
  >
    <img
      class="size-10 aspect-square"
      src={playlist.coverArtUrl ?? '/icons/album-cover-placeholder.png'}
      alt="Playlist cover"
    />
  </button>
  <div class="flex flex-col overflow-hidden text-sm items-start">
    <button
      class="inline-block truncate hover:underline cursor-pointer"
      onclick={() => onPlaylistSelected(playlist)}>{playlist.title}</button
    >
    <p class="text-xs italic">{playlist.trackCount ?? 0} songs</p>
  </div>
</div>
