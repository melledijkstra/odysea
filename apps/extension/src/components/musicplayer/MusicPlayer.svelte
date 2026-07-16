<script lang="ts">
  import Devices from './Devices.svelte'
  import Playback from './Playback.svelte'
  import Playlists from './Playlists.svelte'
  import type { MusicPlayerInterface, Playlist, PlaybackState, Track } from 'MusicPlayer'
  import type { Device } from 'SpotifyApi'
  import ListSkeleton from './ListSkeleton.svelte'
  import ScrollArea from '../atoms/ScrollArea.svelte'
  import TrackList from './TrackList.svelte'

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

  let fetchItems = $state<Promise<Track[]>>()

  function playPause() {
    // Use play or pause based on current playback state
    if (MPState.isPlaying) {
      controller.pause()
    }
    else {
      controller.play()
    }
  }

  async function selectPlaylist(playlist: Playlist) {
    fetchItems = controller.getPlaylistItems(playlist)
  }
</script>

<div class="grid grid-cols-2 grid-rows-3 music-player w-full h-full overflow-hidden">
  <ScrollArea scrollbarClasses="bg-transparent" orientation="vertical">
    {#await controller.getPlaylists()}
      <ListSkeleton amount={20} />
    {:then playlists}
      <Playlists
        playlists={playlists}
        onPlaylistPlay={playlist => controller.playItem(playlist)}
        onPlaylistSelected={playlist => selectPlaylist(playlist)}
      />
    {:catch error}
      <p class="text-sm text-red-500">Error loading playlists: {error.message}</p>
    {/await}
  </ScrollArea>
  <ScrollArea scrollbarClasses="bg-transparent" orientation="vertical">
    {#await fetchItems}
      <ListSkeleton amount={20} />
    {:then trackList}
      <TrackList
        tracks={trackList ?? []}
        onTrackSelected={track => controller.playItem(track)}
      />
    {/await}
  </ScrollArea>
  <Playback
    class="col-span-2"
    playbackState={MPState}
    onPreviousTrack={() => controller.previous()}
    onPlayPause={playPause}
    onNextTrack={() => controller.next()}
    onSeek={pos => controller.seek(pos)}
    onVolumeChange={volume => controller.setVolume(volume)}
    onToggleShuffle={shuffle => controller.toggleShuffle?.(shuffle)}
    onSwitchRepeatMode={mode => controller.switchRepeatMode?.(mode)}
  />
  <Devices
    class="col-span-2"
    playerDeviceId={deviceId}
    devices={devices}
    onActivate={deviceId => controller.activateDevice?.(deviceId)}
  />
</div>

<style>
  .music-player {
    grid-template-columns: 0.5fr 1fr;
    grid-template-rows: 1fr auto auto;
  }
</style>
