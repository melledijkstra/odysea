<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'
  import { Sleep } from '@/modules/trackers/sleep/sleep.svelte'
  import { WebLocalStorage } from '@melledijkstra/storage'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import { addNotification } from '@/stores/notifications.svelte'
  import { SLEEP_SCOPE } from '@/oauth2/scope-registry'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { onMount } from 'svelte'
  import { googleHealthAuthClient } from '@/oauth2/clients'
  import { GoogleHealthApiClient } from '@melledijkstra/api'

  const STORAGE_KEY = 'googlehealth::sleep_minutes'

  const {
    metric,
    minutes,
    ...props
  }: { metric?: Sleep; minutes?: number } & HTMLAttributes<HTMLDivElement> =
    $props()

  const cache = new WebLocalStorage()
  const authState = getAuthContext()
  const client = new GoogleHealthApiClient(googleHealthAuthClient)

  let authenticated = $derived(
    authState?.providers?.['google-health']?.isAuthenticated ?? false
  )
  let fetchedMinutes = $state<number>()
  const sleepMinutes = $derived(minutes ?? fetchedMinutes)

  async function getSleepData() {
    if (!authenticated) return

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
      fetchedMinutes = await client.getSleep()
      metric?.setMinutes(fetchedMinutes)
      await cache.set(STORAGE_KEY, fetchedMinutes, 60 * 60 * 1000) // Cache for 1 hour
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
    authState?.update('google-health', !!tokenData, grantedScopes)

    if (tokenData && grantedScopes.includes(SLEEP_SCOPE)) {
      getSleepData()
    }
  }

  async function initSleepLogic() {
    if (!authenticated) {
      await cache.delete(STORAGE_KEY)
    }

    const cacheSleepMinutes = await cache.get<number>(STORAGE_KEY)
    if (cacheSleepMinutes !== undefined && cacheSleepMinutes !== null) {
      fetchedMinutes = cacheSleepMinutes
      metric?.setMinutes(fetchedMinutes)
      return
    }

    getSleepData()
  }

  onMount(() => {
    initSleepLogic()
  })

  $effect(() => {
    if (authenticated) {
      initSleepLogic()
    }
  })

  const formatted = $derived(Sleep.formatSleepMinutes(sleepMinutes))
</script>

{#if authenticated || minutes !== undefined}
  <div transition:fade {...props}>
    <Tracker.Root class={['text-right', props.class]}>
      <Tracker.Metric>{formatted}</Tracker.Metric>
      <Tracker.IconTitle
        src="/icons/google-health.svg"
        alt="Google Health"
        class="justify-end">Sleep</Tracker.IconTitle
      >
    </Tracker.Root>
  </div>
{:else}
  <div class="flex flex-col gap-1 items-center">
    <img src="/icons/google-health.svg" class="w-[2em]" alt="Google Health" />
    <Toggle toggleSize="small" checked={authenticated} onclick={authenticate} />
  </div>
{/if}
