<script lang="ts">
  import { switchAppMode } from '@/app-state.svelte'
  import MenuButton from '@melledijkstra/ui/svelte/MenuButton.svelte'
  import { mdiSprout } from '@mdi/js'
</script>

<MenuButton
  tooltip="Focus"
  onclick={() => switchAppMode('focus')}
  mdiIcon={mdiSprout}
/>
