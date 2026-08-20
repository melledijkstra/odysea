<script lang="ts">
  import { onMount } from 'svelte'
  import { ACCOUNT_CACHE_KEY } from '../../constants'
  import { GoogleAccountApiClient, type Account } from '@melledijkstra/api'
  import { googleAuthClient } from '@/oauth2/clients'
  import { WebLocalStorage } from '@melledijkstra/storage'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { appState } from '@/app-state.svelte'

  const authState = getAuthContext()

  let prevGoogleAuth = $state.raw(authState.providers.google.isAuthenticated)

  const storage = new WebLocalStorage()
  const client = new GoogleAccountApiClient(googleAuthClient)

  async function getAccountInfo() {
    if (!authState.providers.google.isAuthenticated) {
      return
    }

    const cachedAccountInfo = await storage.get<Account>(ACCOUNT_CACHE_KEY)

    if (cachedAccountInfo) {
      appState.account = cachedAccountInfo
      return
    }

    const fetchedAccountInfo = await client.fetchAccountInfo()

    if (fetchedAccountInfo) {
      appState.account = fetchedAccountInfo
      storage.set<Account>(ACCOUNT_CACHE_KEY, fetchedAccountInfo)
    }
  }

  onMount(() => {
    getAccountInfo()
  })

  $effect(() => {
    if (prevGoogleAuth === authState.providers.google.isAuthenticated) {
      return
    }

    const googleAuth = authState.providers.google.isAuthenticated
    prevGoogleAuth = googleAuth

    if (authState.providers.google.isAuthenticated) {
      getAccountInfo()
    } else {
      appState.account = undefined
      storage.delete(ACCOUNT_CACHE_KEY)
    }
  })
</script>

<a href="https://myaccount.google.com/" target="_blank">
  <img
    class="size-9 aspect-square rounded-full border-2 border-white/80"
    src={appState.account?.picture ?? '/icons/default-account.jpg'}
    alt={appState.account?.name ?? 'Account picture'}
  />
</a>
