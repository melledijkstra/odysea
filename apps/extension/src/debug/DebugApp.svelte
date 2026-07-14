<script lang="ts">
  import ContextMenu from '@/components/atoms/ContextMenu.svelte'
  import DropdownMenu from '@/components/atoms/DropdownMenu.svelte'
  import { loadModule } from '@/modules'
  import { onMount } from 'svelte'

  const hello = $state('Hi there')
  let isOpen = $state(false)

  onMount(() => {
    console.log('DebugApp mounted')
  })

  function onSelect(label: string) {
    console.log('you selected', label)
  }

  const menuItems = [
    { label: 'Dunder Mifflin', onSelect },
    { label: 'Vance Refrigeration', onSelect },
    { label: 'Michael Scott Paper Company', onSelect }
  ]
</script>

<main class="text-white p-5">
  <h1 class="text-2xl font-bold">{hello}</h1>
  <p>This is a debug page for testing</p>
  {#await loadModule('habits') then Module}
    <Module.scene />
  {/await}
</main>

<div class="relative">
  <ContextMenu
    bind:open={isOpen}
    items={menuItems}
  >
    <div
      class="size-30 text-white place-items-center rounded-lg border border-dashed p-4"
    >
      Right-click me
    </div>
  </ContextMenu>
  <DropdownMenu
    items={menuItems}
  >
    <button onclick={() => (isOpen = true)}>Open Dropdown Menu</button>
  </DropdownMenu>
</div>


<style>
  :global(body) {
    color: white;
  }
</style>
