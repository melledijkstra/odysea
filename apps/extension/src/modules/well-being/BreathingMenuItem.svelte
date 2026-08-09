<script lang="ts">
  import { switchAppMode } from '@/app-state.svelte'
  import MenuButton from '@melledijkstra/ui/svelte/MenuButton.svelte'
  import { mdiSpa } from '@mdi/js'
</script>

<MenuButton
  tooltip="Breathing"
  onclick={() => switchAppMode('breathing')}
  mdiIcon={mdiSpa}
/>
