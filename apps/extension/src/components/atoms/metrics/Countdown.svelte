<script lang="ts">
  import type { CountdownMetric } from '@/modules/trackers/state.svelte'
  import { calculateRemainingDays } from '@melledijkstra/toolbox'
  import { fade } from 'svelte/transition'

  const { metric }: { metric: CountdownMetric } = $props()
</script>

<div transition:fade class="dark:text-white text-black">
  <p class="text-base truncate">{calculateRemainingDays(metric.date)}d</p>
  <p class="text-xs truncate leading-tight">{metric.name}</p>
</div>
