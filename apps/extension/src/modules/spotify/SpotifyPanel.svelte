<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { SpotifyController } from '@/controllers/SpotifyController'
  import MusicPlayer from '@/components/musicplayer/MusicPlayer.svelte'
  import { spotifyState } from './spotify.state.svelte'
  import PopPanel from '@/components/atoms/PopPanel.svelte'
  import type { PlaybackState } from 'MusicPlayer'
  import AuthButton from '@/components/AuthButton.svelte'

  const { playbackState, controller }: {
    playbackState: PlaybackState
    controller: SpotifyController
  } = $props()

  let hasTabLock = $state(false)

  function cleanup() {
    controller?.destroy()
    window.removeEventListener('beforeunload', cleanup)
  }

  onMount(async () => {
    window.addEventListener('beforeunload', cleanup)

    await controller.initialize()
    hasTabLock = true
    if (spotifyState.isAuthenticated) {
      controller.syncState()
    }
  })

  async function authenticate() {
    const token = await controller.auth.getAuthToken(true)
    if (token) {
      controller.syncState()
    }
  }

  onDestroy(cleanup)
</script>

<PopPanel panelProps={{
  size: 'large',
  nopadding: true,
}} class="flex flex-col">
  {#if !hasTabLock}
    <div class="flex flex-col gap-4 items-center justify-center h-full">
      <p class="text-center text-lg">The Spotify Music Player is already initialized in another tab</p>
      <p class="text-center text-sm">
        If you want to use the player here, close the other tab or reload this one.
      </p>
    </div>
  {:else}
    {#if !spotifyState.isAuthenticated}
      <div class="flex flex-col gap-4 items-center justify-center h-full">
        <p class="text-center text-lg">You are not authenticated with Spotify</p>
        <AuthButton provider="spotify" onclick={authenticate} />
      </div>
    {:else}
      <MusicPlayer
        state={playbackState}
        controller={controller}
        deviceId={spotifyState.deviceId}
        devices={spotifyState.devices}
      />
    {/if}
  {/if}
</PopPanel>
