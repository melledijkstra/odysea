<script lang="ts">
  import { onMount } from 'svelte'
  import { ACCOUNT_CACHE_KEY } from '../../constants'
  import { GoogleAccountApiClient, type Account } from '@melledijkstra/api'
  import { AuthClient } from '@melledijkstra/extension'
  import { GoogleAuthProvider } from '@/oauth2/providers'

  const auth = new AuthClient(new GoogleAuthProvider())
  const client = new GoogleAccountApiClient(auth)

  let accountInfo = $state<Account>()

  async function getAccountInfo() {
    const cachedAccountInfo = localStorage.getItem(ACCOUNT_CACHE_KEY)

    if (cachedAccountInfo) {
      accountInfo = JSON.parse(cachedAccountInfo) as Account
      return
    }

    const fetchedAccountInfo = await client.fetchAccountInfo()

    if (fetchedAccountInfo) {
      accountInfo = fetchedAccountInfo
      localStorage.setItem(
        ACCOUNT_CACHE_KEY,
        JSON.stringify(fetchedAccountInfo)
      )
    }
  }

  onMount(() => {
    getAccountInfo()
  })
</script>

<a href="https://myaccount.google.com/" target="_blank">
  <img
    class="size-9 aspect-square rounded-full border-2 border-white/80"
    src={accountInfo?.picture ?? '/icons/default-account.jpg'}
    alt={accountInfo?.name ?? 'Account picture'}
  />
</a>
