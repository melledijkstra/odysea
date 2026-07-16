<script lang="ts">
  import { switchAppMode } from '@/app-state.svelte'
  import MenuButton from '@/components/atoms/MenuButton.svelte'
  import { mdiSpa } from '@mdi/js'
</script>

<MenuButton
  tooltip="Breathing"
  onclick={() => switchAppMode('breathing')}
  mdiIcon={mdiSpa}
/>
