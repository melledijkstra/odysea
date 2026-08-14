<script lang="ts">
  import type { CountdownMetric } from '@/modules/trackers/types'
  import { calculateRemainingDays } from '@melledijkstra/toolbox'
  import { fade } from 'svelte/transition'
  import { Trackers } from './index'

  const { metric }: { metric: CountdownMetric } = $props()
</script>

<div transition:fade>
  <Trackers.Root>
    <Trackers.Metric>{calculateRemainingDays(metric.date)}d</Trackers.Metric>
    <Trackers.Title>{metric.name}</Trackers.Title>
  </Trackers.Root>
</div>
