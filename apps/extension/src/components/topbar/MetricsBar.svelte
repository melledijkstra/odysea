<script lang="ts">
  import { WebLocalStorage } from '@melledijkstra/storage'
  import { trackers } from '@/modules/trackers/state.svelte'
  import Clock from '@/components/atoms/metrics/WorldClock.svelte'
  import Countdown from '../atoms/metrics/Countdown.svelte'
  import { onMount } from 'svelte'
  import Sleep from '../atoms/metrics/Sleep.svelte'
  import { AuthClient } from '@melledijkstra/extension'
  import { GoogleHealthAuthProvider } from '@/oauth2/providers'
  import { GoogleHealthApiClient } from '@melledijkstra/api'

  const cache = new WebLocalStorage()

  const STORAGE_KEY = 'googlehealth::sleep_minutes'

  const authClient = new AuthClient(new GoogleHealthAuthProvider())

  let client = $state<GoogleHealthApiClient>()

  let sleepMinutes = $state<number>() // Default to 8 hours in minutes

  const metrics = $derived.by(() => {
    return trackers.allMetrics.filter((metric) => metric.pinned)
  })

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
    if (!trackers.sleepEnabled) {
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

{#if metrics.length > 0}
  <div class="flex flex-row gap-5 items-center">
    {#each metrics as metric (metric.id)}
      {#if metric.type === 'worldClock'}
        <Clock {metric} />
      {:else if metric.type === 'countdown'}
        <Countdown {metric} />
      {:else if metric.type === 'sleep'}
        <Sleep
          oncontextmenu={(e) => {
            e.preventDefault()
            authenticate()
          }}
          minutes={sleepMinutes}
        />
      {:else if metric.type === 'counter'}
        <div class="dark:text-white text-black rounded-lg text-right">
          <p class="text-base leading-none">{metric.value}</p>
          <p class="text-xs">{metric.name}</p>
        </div>
      {/if}
    {/each}
  </div>
{/if}
