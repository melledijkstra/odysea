<script lang="ts">
  import type { WorldClockMetric } from '@/modules/trackers/types'
  import { onPageVisible } from '@/utils/visibility'
  import { renderTimezone, repeatEvery } from '@melledijkstra/toolbox'
  import { onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'

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

  $effect(() => {
    return onPageVisible(() => {
      updateKey = Date.now()
    })
  })
</script>

<div transition:fade>
  <Tracker.Root>
    {#key updateKey}
      <Tracker.Metric>{renderTimezone(metric.timeZone)}</Tracker.Metric>
    {/key}
    <Tracker.Title>{metric.name}</Tracker.Title>
  </Tracker.Root>
</div>
