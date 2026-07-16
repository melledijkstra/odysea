<script lang="ts">
  import { loadModule, type ModuleID } from '@/modules'

  interface Props {
    id: ModuleID
    type?: 'component' | 'scene' | 'trigger'
  }

  const { id, type = 'component' }: Props = $props()
</script>

{#await loadModule(id) then Module}
  {#if type === 'component' && Module.component}
    <Module.component />
  {:else if type === 'scene' && Module.scene}
    <Module.scene />
  {:else if type === 'trigger' && Module.trigger}
    <Module.trigger />
  {/if}
{:catch error}
  <p class="text-red-500 text-sm">Failed to load module '{id}': {error.message}</p>
{/await}
