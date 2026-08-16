<script lang="ts">
  import { WebLocalStorage } from '@melledijkstra/storage'
  import { trackers } from '@/modules/trackers/state.svelte'
  import Clock from '@/components/atoms/metrics/WorldClock.svelte'
  import Countdown from '../atoms/metrics/Countdown.svelte'
  import Counter from '../atoms/metrics/Counter.svelte'
  import { onMount } from 'svelte'
  import Sleep from '../atoms/metrics/Sleep.svelte'
  import { googleHealthAuthClient } from '@/oauth2/clients'
  import { GoogleHealthApiClient } from '@melledijkstra/api'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import { addNotification } from '@/stores/notifications.svelte'
  import { SLEEP_SCOPE } from '@/oauth2/scope-registry'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'

  const cache = new WebLocalStorage()

  const STORAGE_KEY = 'googlehealth::sleep_minutes'

  const client = new GoogleHealthApiClient(googleHealthAuthClient)

  const authState = getAuthContext()

  let authenticated = $derived(
    authState.providers['google-health'].isAuthenticated
  )

  let sleepMinutes = $state<number>()

  const pinnedMetrics = $derived.by(() => {
    return trackers.allMetrics.filter((metric) => metric.pinned)
  })

  async function getSleepData() {
    if (!authenticated) {
      return
    }

    const grantedScopes = await googleHealthAuthClient.getGrantedScopes()
    if (!grantedScopes.includes(SLEEP_SCOPE)) {
      addNotification({
        type: 'error',
        message:
          'You need to grant access to your Google Health sleep data to use this feature.',
      })
      return
    }

    try {
      sleepMinutes = await client.getSleep()
      await cache.set(STORAGE_KEY, sleepMinutes, 60 * 60 * 1000) // Cache for 1 hour
    } catch (error) {
      console.error('Error fetching sleep data:', error)
      addNotification({
        type: 'error',
        message: 'Failed to fetch sleep data from Google Health.',
      })
    }
  }

  async function authenticate() {
    const tokenData = await googleHealthAuthClient.authenticate([SLEEP_SCOPE])
    const grantedScopes = await googleHealthAuthClient.getGrantedScopes()
    authState.update('google-health', !!tokenData, grantedScopes)

    if (tokenData && grantedScopes.includes(SLEEP_SCOPE)) {
      getSleepData()
    }
  }

  async function initSleepLogic() {
    if (!authenticated) {
      await cache.delete(STORAGE_KEY)
    }

    const cacheSleepMinutes = await cache.get<number>(STORAGE_KEY)

    // if we have cached sleep minutes, use them
    if (cacheSleepMinutes !== undefined && cacheSleepMinutes !== null) {
      sleepMinutes = cacheSleepMinutes
      return
    }

    getSleepData()
  }

  onMount(() => {
    if (trackers.sleepEnabled) {
      initSleepLogic()
    }
  })

  $effect(() => {
    // if sleep tracking is enabled, initialize the sleep logic
    if (trackers.sleepEnabled) {
      initSleepLogic()
    }
  })
</script>

{#if pinnedMetrics.length > 0}
  <div class="flex flex-row gap-5 items-center">
    {#each pinnedMetrics as metric (metric.id)}
      {#if metric.type === 'worldClock'}
        <Clock {metric} />
      {:else if metric.type === 'countdown'}
        <Countdown {metric} />
      {:else if metric.type === 'sleep'}
        {#if authenticated}
          <Sleep minutes={sleepMinutes} />
        {:else}
          <div class="flex flex-col gap-1 items-center">
            <img
              src="/icons/google-health.svg"
              class="w-[2em]"
              alt="Google Health"
            />
            <Toggle
              toggleSize="small"
              bind:checked={authenticated}
              onclick={authenticate}
            />
          </div>
        {/if}
      {:else if metric.type === 'counter'}
        <Counter {metric} />
      {/if}
    {/each}
  </div>
{/if}
