<script lang="ts">
  import Devices from './Devices.svelte'
  import Playback from './Playback.svelte'
  import Playlists from './Playlists.svelte'
  import type {
    MusicPlayerInterface,
    Playlist,
    PlaybackState,
  } from 'MusicPlayer'
  import type { Device } from '@melledijkstra/api'
  import ListSkeleton from './ListSkeleton.svelte'
  import ScrollArea from '@melledijkstra/ui/svelte/ScrollArea.svelte'
  import TrackList from './TrackList.svelte'
  import { createQuery } from '@tanstack/svelte-query'

  const {
    state: MPState,
    controller,
    devices,
    deviceId,
  }: {
    state: PlaybackState
    controller: MusicPlayerInterface
    devices: Device[]
    deviceId?: string
  } = $props()

  let selectedPlaylist = $state<Playlist | null>(null)

  const playlistsQuery = createQuery(() => ({
    queryKey: ['musicplayer', 'playlists'],
    queryFn: () => controller.getPlaylists(),
    staleTime: 5 * 60 * 1000,
  }))

  const tracksQuery = createQuery(() => ({
    queryKey: ['musicplayer', 'tracks', selectedPlaylist?.id],
    queryFn: async () => {
      if (!selectedPlaylist) return []
      return controller.getPlaylistItems(selectedPlaylist)
    },
    enabled: !!selectedPlaylist,
    staleTime: 5 * 60 * 1000,
  }))

  function playPause() {
    // Use play or pause based on current playback state
    if (MPState.isPlaying) {
      controller.pause()
    } else {
      controller.play()
    }
  }

  function selectPlaylist(playlist: Playlist) {
    selectedPlaylist = playlist
  }
</script>

<div
  class="grid grid-cols-2 grid-rows-3 music-player w-full h-full overflow-hidden"
>
  <ScrollArea scrollbarClasses="bg-transparent" orientation="vertical">
    {#if playlistsQuery.isPending}
      <ListSkeleton amount={20} />
    {:else if playlistsQuery.isError}
      <p class="text-sm text-red-500">
        Error loading playlists: {playlistsQuery.error?.message}
      </p>
    {:else if playlistsQuery.data}
      <Playlists
        playlists={playlistsQuery.data}
        onPlaylistPlay={(playlist) => controller.playItem(playlist)}
        onPlaylistSelected={(playlist) => selectPlaylist(playlist)}
      />
    {/if}
  </ScrollArea>
  <ScrollArea scrollbarClasses="bg-transparent" orientation="vertical">
    {#if tracksQuery.isPending && selectedPlaylist}
      <ListSkeleton amount={20} />
    {:else if tracksQuery.isError}
      <p class="text-sm text-red-500">
        Error loading tracks: {tracksQuery.error?.message}
      </p>
    {:else if tracksQuery.data}
      <TrackList
        tracks={tracksQuery.data}
        onTrackSelected={(track) => controller.playItem(track)}
      />
    {/if}
  </ScrollArea>
  <Playback
    class="col-span-2"
    playbackState={MPState}
    onPreviousTrack={() => controller.previous()}
    onPlayPause={playPause}
    onNextTrack={() => controller.next()}
    onSeek={(pos) => controller.seek(pos)}
    onVolumeChange={(volume) => controller.setVolume(volume)}
    onToggleShuffle={(shuffle) => controller.toggleShuffle?.(shuffle)}
    onSwitchRepeatMode={(mode) => controller.switchRepeatMode?.(mode)}
  />
  <Devices
    class="col-span-2"
    playerDeviceId={deviceId}
    {devices}
    onActivate={(deviceId) => controller.activateDevice?.(deviceId)}
  />
</div>

<style>
  .music-player {
    grid-template-columns: 0.5fr 1fr;
    grid-template-rows: 1fr auto auto;
  }
</style>
