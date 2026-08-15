<script lang="ts">
  import Spinner from '@melledijkstra/ui/svelte/Spinner.svelte'

  let { displayUnit }: { displayUnit?: 'C' | 'F' } = $props()

  const temperatureSymbol = $derived(displayUnit === 'F' ? '°F' : '°C')
</script>

<div class="flex flex-col items-end text-black dark:text-white">
  <div class="flex flex-row items-center gap-1">
    <Spinner size={20} />
    <span class="text-base">?<sup>{temperatureSymbol}</sup></span>
  </div>
  <span class="text-xs max-w-20 overflow-hidden text-ellipsis whitespace-nowrap"
    >Loading...</span
  >
</div>
