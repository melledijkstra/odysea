<script lang="ts">
  import { trackers } from '@/modules/trackers/state.svelte'
  import Countdown from '@/components/trackers/Countdown.svelte'
  import Counter from '@/components/trackers/Counter.svelte'
  import Gmail from '@/components/trackers/Gmail.svelte'
  import Sleep from '@/components/trackers/Sleep.svelte'
  import WorldClock from '@/components/trackers/WorldClockTracker.svelte'
  import type { Countdown as CountdownModel } from '@/modules/trackers/countdown/countdown.svelte'
  import type { Counter as CounterModel } from '@/modules/trackers/counter/counter.svelte'
  import type { Gmail as GmailModel } from '@/modules/trackers/gmail/gmail.svelte'
  import type { Sleep as SleepModel } from '@/modules/trackers/sleep/sleep.svelte'
  import type { WorldClock as WorldClockModel } from '@/modules/trackers/worldclock/worldclock.svelte'

  const pinnedMetrics = $derived.by(() => {
    return trackers.metrics.filter((metric) => metric.pinned)
  })
</script>

{#if pinnedMetrics.length > 0}
  <div class="flex flex-row gap-5 items-center">
    {#each pinnedMetrics as metric (metric.id)}
      {#if metric.type === 'counter'}
        <Counter metric={metric as CounterModel} />
      {:else if metric.type === 'countdown'}
        <Countdown metric={metric as CountdownModel} />
      {:else if metric.type === 'worldClock'}
        <WorldClock metric={metric as WorldClockModel} />
      {:else if metric.type === 'sleep'}
        <Sleep metric={metric as SleepModel} />
      {:else if metric.type === 'gmail'}
        <Gmail metric={metric as GmailModel} />
      {/if}
    {/each}
  </div>
{/if}
