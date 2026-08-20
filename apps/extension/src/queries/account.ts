import { getAuthContext } from '@/oauth2/auth.state.svelte'
import { GoogleAccountApiClient, type Account } from '@melledijkstra/api'
import { googleAuthClient } from '@/oauth2/clients'
import { createQuery } from '@tanstack/svelte-query'

export function useAccountQuery() {
  const authState = getAuthContext()
  const client = new GoogleAccountApiClient(googleAuthClient)

  return createQuery<Account | null>(() => ({
    queryKey: ['account', 'google'],
    queryFn: async (): Promise<Account | null> => {
      const account = await client.fetchAccountInfo()
      return account ?? null
    },
    enabled: authState.providers.google.isAuthenticated,
    staleTime: 60 * 60 * 1000, // 1 hour
  }))
}
