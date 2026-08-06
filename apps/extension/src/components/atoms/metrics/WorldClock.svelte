<script lang="ts">
  import type { WorldClockMetric } from '@/modules/trackers/state.svelte'
  import { renderTimezone, repeatEvery } from '@melledijkstra/toolbox'
  import { onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  const { metric }: { metric: WorldClockMetric } = $props()

  let updateKey = $state(Date.now())

  let cancelUpdater = $state<() => void>()

  onMount(() => {
    cancelUpdater = repeatEvery(() => {
      updateKey = Date.now()
    }, 60 * 1000) // every minute
  })

  onDestroy(() => {
    cancelUpdater?.()
  })
</script>

<div transition:fade class="dark:text-white text-black">
  {#key updateKey}
    <p class="text-base truncate">{renderTimezone(metric.timeZone)}</p>
  {/key}
  <p class="text-xs truncate leading-tight">{metric.name}</p>
</div>
