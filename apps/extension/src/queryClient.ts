import { QueryClient } from '@tanstack/svelte-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // General default config for extension data, can be overridden per query
      staleTime: 60 * 1000,
    },
  },
})
