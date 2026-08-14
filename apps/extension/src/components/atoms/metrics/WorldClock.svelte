<script lang="ts">
  import type { WorldClockMetric } from '@/modules/trackers/types'
  import { onPageVisible } from '@/utils/visibility'
  import { renderTimezone, repeatEvery } from '@melledijkstra/toolbox'
  import { onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Trackers } from './index'

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
  <Trackers.Root>
    {#key updateKey}
      <Trackers.Metric>{renderTimezone(metric.timeZone)}</Trackers.Metric>
    {/key}
    <Trackers.Title>{metric.name}</Trackers.Title>
  </Trackers.Root>
</div>
