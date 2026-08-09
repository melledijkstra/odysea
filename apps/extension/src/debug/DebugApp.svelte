<script lang="ts">
  import { loadModule } from '@/modules'
  import { onMount } from 'svelte'
  import { settings } from '@/settings/index.svelte'

  settings.initialize()

  const hello = $state('Hi there')

  onMount(() => {
    console.log('DebugApp mounted')
  })
</script>

<main class="text-white p-5">
  <h1 class="text-2xl font-bold">{hello}</h1>
  <h2 class="text-xl font-bold">Habits</h2>
  <p>This is a debug page for testing</p>
  {#await loadModule('habits') then Module}
    <Module.scene />
  {/await}
</main>

<style>
  :global(body) {
    color: white;
  }
</style>
