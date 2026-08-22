<script lang="ts">
  import { Countdown } from '@/modules/trackers/countdown/countdown.svelte'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'

  const { metric }: { metric: Countdown } = $props()
</script>

<div transition:fade>
  <Tracker.Root>
    <Tracker.Metric>{metric.formatValue()}</Tracker.Metric>
    <Tracker.Title>{metric.name}</Tracker.Title>
  </Tracker.Root>
</div>
