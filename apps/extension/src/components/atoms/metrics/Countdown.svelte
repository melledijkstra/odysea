<script lang="ts">
  import type { CountdownMetric } from '@/modules/trackers/types'
  import { calculateRemainingDays } from '@melledijkstra/toolbox'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'

  const { metric }: { metric: CountdownMetric } = $props()
</script>

<div transition:fade>
  <Tracker.Root>
    <Tracker.Metric>{calculateRemainingDays(metric.date)}d</Tracker.Metric>
    <Tracker.Title>{metric.name}</Tracker.Title>
  </Tracker.Root>
</div>
