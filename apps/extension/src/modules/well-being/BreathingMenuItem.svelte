<script lang="ts">
  import { switchAppMode } from '@/app-state.svelte'
  import MenuButton from '@melledijkstra/ui/svelte/MenuButton.svelte'
  import { mdiSpa } from '@mdi/js'
  import { spotifyState } from '@/modules/spotify/spotify.state.svelte'
</script>

<MenuButton
  tooltip="Breathing"
  tooltipDisabled={spotifyState.isPanelOpen}
  onclick={() => switchAppMode('breathing')}
  mdiIcon={mdiSpa}
/>
