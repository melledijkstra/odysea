<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'
  import { Gmail } from '@/modules/trackers/gmail/gmail.svelte'
  import { WebLocalStorage } from '@melledijkstra/storage'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import { addNotification } from '@/stores/notifications.svelte'
  import { GMAIL_SCOPE } from '@/oauth2/scope-registry'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { onMount } from 'svelte'
  import { googleAuthClient } from '@/oauth2/clients'
  import { GoogleGmailApiClient } from '@melledijkstra/api'

  const STORAGE_KEY = 'google::gmail_unread'

  const {
    metric,
    unread,
    ...props
  }: { metric?: Gmail; unread?: number } & HTMLAttributes<HTMLDivElement> =
    $props()

  const cache = new WebLocalStorage()
  const authState = getAuthContext()
  const client = new GoogleGmailApiClient(googleAuthClient)

  let authenticated = $derived(
    (authState?.providers?.['google']?.isAuthenticated ?? false) &&
      (authState?.providers?.['google']?.scopes?.includes(GMAIL_SCOPE) ?? false)
  )
  let fetchedUnread = $state<number>()
  const unreadCount = $derived(unread ?? fetchedUnread)

  async function getGmailData() {
    if (!authenticated) return

    const grantedScopes = await googleAuthClient.getGrantedScopes()
    if (!grantedScopes.includes(GMAIL_SCOPE)) {
      addNotification({
        type: 'error',
        message:
          'You need to grant access to your Gmail data to use this feature.',
      })
      return
    }

    try {
      fetchedUnread = await client.getUnreadCount('INBOX')
      metric?.setUnread(fetchedUnread)
      await cache.set(STORAGE_KEY, fetchedUnread, 5 * 60 * 1000) // Cache for 5 minutes
    } catch (error) {
      console.error('Error fetching Gmail data:', error)
      addNotification({
        type: 'error',
        message: 'Failed to fetch Gmail data from Google.',
      })
    }
  }

  async function authenticate() {
    const tokenData = await googleAuthClient.authenticate([GMAIL_SCOPE])
    const grantedScopes = await googleAuthClient.getGrantedScopes()
    authState?.update('google', !!tokenData, grantedScopes)

    if (tokenData && grantedScopes.includes(GMAIL_SCOPE)) {
      getGmailData()
    }
  }

  async function initGmailLogic() {
    if (!authenticated) {
      await cache.delete(STORAGE_KEY)
    }

    const cacheUnread = await cache.get<number>(STORAGE_KEY)
    if (cacheUnread !== undefined && cacheUnread !== null) {
      fetchedUnread = cacheUnread
      metric?.setUnread(fetchedUnread)
      return
    }

    getGmailData()
  }

  onMount(() => {
    initGmailLogic()
  })

  $effect(() => {
    if (authenticated) {
      initGmailLogic()
    }
  })

  const formatted = $derived(
    unreadCount === undefined || unreadCount < 0
      ? 'No data'
      : `${unreadCount} unread`
  )
</script>

{#if authenticated || unread !== undefined}
  <div transition:fade {...props}>
    <Tracker.Root class={['text-right', props.class]}>
      <Tracker.Metric>{formatted}</Tracker.Metric>
      <Tracker.IconTitle
        src="/icons/google-gmail.svg"
        alt="Gmail"
        class="justify-end">Gmail</Tracker.IconTitle
      >
    </Tracker.Root>
  </div>
{:else}
  <div class="flex flex-col gap-1 items-center">
    <img src="/icons/google-gmail.svg" class="w-[2em]" alt="Gmail" />
    <Toggle toggleSize="small" checked={authenticated} onclick={authenticate} />
  </div>
{/if}
