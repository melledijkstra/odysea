<script lang="ts">
  import { WebLocalStorage } from '@melledijkstra/storage'
  import {
    getIsSleepMetricEnabled,
    setIsSleepMetricEnabled,
    trackers,
    type CountDown,
    type Counter,
    type WorldClock,
  } from '@/modules/trackers/state.svelte'
  import Clock from '@/components/atoms/metrics/WorldClock.svelte'
  import Countdown from '../atoms/metrics/Countdown.svelte'
  import { onMount } from 'svelte'
  import Sleep from '../atoms/metrics/Sleep.svelte'
  import { AuthClient } from '@melledijkstra/extension'
  import { GoogleHealthAuthProvider } from '@/oauth2/providers'
  import { GoogleHealthApiClient } from '@melledijkstra/api'

  const cache = new WebLocalStorage()

  type Metric = CountDown | WorldClock | Counter

  const STORAGE_KEY = 'googlehealth::sleep_minutes'

  const authClient = new AuthClient(new GoogleHealthAuthProvider())

  const props: { metrics?: Metric[] } = $props()
  let sleepMetricEnabled = $state(false)

  let client = $state<GoogleHealthApiClient>()

  let sleepMinutes = $state<number>() // Default to 8 hours in minutes

  const metrics: Metric[] = $derived.by(() => {
    if (props.metrics?.length) {
      return props.metrics.filter((metric) => metric.pinned)
    }

    const pinnedCounters = trackers.counters.filter((counter) => counter.pinned)
    const pinnedClocks = trackers.worldClocks.filter((clock) => clock.pinned)
    const pinnedCountdowns = trackers.countdowns.filter(
      (countdown) => countdown.pinned
    )
    return [...pinnedClocks, ...pinnedCountdowns, ...pinnedCounters]
  })

  function isCounter(metric: unknown): metric is CountDown {
    return typeof (metric as CountDown)?.date !== 'undefined'
  }

  function isClock(metric: unknown): metric is WorldClock {
    return typeof (metric as WorldClock)?.timeZone !== 'undefined'
  }

  async function getSleepData() {
    if (!client) {
      client = new GoogleHealthApiClient(authClient)
    }
    sleepMinutes = await client.getSleep()
    await cache.set(STORAGE_KEY, sleepMinutes, 60 * 60 * 1000) // Cache for 1 hour
  }

  async function authenticate() {
    const tokenData = await authClient.getAuthToken(true)
    if (tokenData) {
      getSleepData()
    }
  }

  onMount(async () => {
    sleepMetricEnabled = getIsSleepMetricEnabled()
    if (!sleepMetricEnabled) {
      return
    }

    const cacheSleepMinutes = await cache.get<number>(STORAGE_KEY)

    // if we have cached sleep minutes, use them
    if (cacheSleepMinutes !== undefined && cacheSleepMinutes !== null) {
      sleepMinutes = cacheSleepMinutes
      return
    }

    getSleepData()
  })
</script>

{#if !!metrics.length || sleepMetricEnabled}
  <div class="flex flex-row gap-5 items-center">
    {#each metrics as metric, i (i)}
      {#if isClock(metric)}
        <Clock {metric} />
      {:else if isCounter(metric)}
        <Countdown {metric} />
      {:else}
        <div class="dark:text-white text-black rounded-lg text-right">
          <p class="text-base leading-none">{metric.value}</p>
          <p class="text-xs">{metric.name}</p>
        </div>
      {/if}
    {/each}
    {#if sleepMetricEnabled}
      <Sleep
        class="cursor-pointer"
        onclick={() => setIsSleepMetricEnabled(false)}
        oncontextmenu={(e) => {
          e.preventDefault()
          authenticate()
        }}
        minutes={sleepMinutes}
      />
    {/if}
  </div>
{/if}
