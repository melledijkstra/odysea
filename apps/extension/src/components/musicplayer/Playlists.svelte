<script lang="ts">
  import type { Playlist } from 'MusicPlayer'
  import PlaylistItem from './PlaylistItem.svelte'

  const { playlists, onPlaylistSelected, onPlaylistPlay }: {
    playlists: Playlist[]
    onPlaylistSelected: (playlist: Playlist) => void
    onPlaylistPlay: (playlist: Playlist) => void
  } = $props()
</script>

{#if playlists.length}
  <ul>
    {#each playlists as playlist (playlist.id)}
      <li>
        <PlaylistItem
          playlist={playlist}
          onPlaylistPlay={onPlaylistPlay}
          onPlaylistSelected={onPlaylistSelected}
        />
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-sm text-center text-white">No playlists found</p>
{/if}
