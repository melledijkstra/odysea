<script lang="ts">
  import { mdiSpotify } from '@mdi/js'
  import { Popover } from 'bits-ui'
  import Icon from '@/components/atoms/Icon.svelte'
  import SpotifyPanel from './SpotifyPanel.svelte'
  import { SpotifyController } from '@/controllers/SpotifyController'
  import { MPState } from '@/components/musicplayer/state.svelte'
  import { spotifyState } from './spotify.state.svelte'
  import { onMount } from 'svelte'

  const controller = $state<SpotifyController>(new SpotifyController(MPState))

  onMount(() => {
    const closePanel = () => {
      spotifyState.isPanelOpen = false
    }
    window.addEventListener('app:close-panels', closePanel)
    return () => window.removeEventListener('app:close-panels', closePanel)
  })
</script>

<Popover.Root bind:open={spotifyState.isPanelOpen}>
  <Popover.Trigger
    class={[
      'dark:text-white/70 dark:hover:text-white text-zinc-500 hover:text-zinc-700',
      'block cursor-pointer transition-colors',
    ]}
  >
    <Icon path={mdiSpotify} size={36} />
  </Popover.Trigger>
  <SpotifyPanel playbackState={MPState.playback} {controller} />
</Popover.Root>
