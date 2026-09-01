import { authState } from '@/oauth2/auth.state.svelte'
import { GoogleAccountApiClient, type Account } from '@melledijkstra/api'
import { WebLocalStorage, hours } from '@melledijkstra/storage'
import { ACCOUNT_CACHE_KEY } from '@/constants'
import { createQuery } from '@tanstack/svelte-query'

const storage = new WebLocalStorage()

export function useAccountQuery() {
  const client = new GoogleAccountApiClient(authState.clients.google)

  return createQuery<Account | null>(() => ({
    queryKey: ['account', 'google'],
    queryFn: async (): Promise<Account | null> => {
      const cached = await storage.get<Account>(ACCOUNT_CACHE_KEY)
      if (cached) {
        return cached
      }

      const account = await client.fetchAccountInfo()
      if (account) {
        await storage.set<Account>(ACCOUNT_CACHE_KEY, account, hours(24))
        return account
      }

      return null
    },
    enabled: authState.providers.google.isAuthenticated,
    staleTime: 60 * 60 * 1000, // 1 hour
  }))
}

export async function clearAccountCache(): Promise<void> {
  await storage.delete(ACCOUNT_CACHE_KEY)
}
