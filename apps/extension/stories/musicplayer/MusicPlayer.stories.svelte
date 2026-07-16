<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import MusicPlayer from '@/components/musicplayer/MusicPlayer.svelte'
  import { MockMusicPlayerController } from '@/mocks/MockMusicPlayerController'
  import { playbackState } from '@/fixtures/musicplayer/state'
  import { devices } from '@/fixtures/spotify/devices'
  import Panel from '@/components/atoms/Panel.svelte'
  import type { MusicPlayerState } from '@/components/musicplayer/state.svelte'

  const state: MusicPlayerState = $state({
    playback: playbackState,
    playlists: [],
  })

  const controller = new MockMusicPlayerController(state)

  const { Story } = defineMeta({
    title: 'Music Player/MusicPlayer',
    component: MusicPlayer,
    args: {
      state: state.playback,
      controller,
      devices: devices,
      deviceId: devices[0].id,
    },
  })
</script>

<Story name="Interactive">
  {#snippet template(args)}
    <Panel nopadding size="large">
      <MusicPlayer {...args} />
    </Panel>
  {/snippet}
</Story>
