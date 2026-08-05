import { QueryClient } from '@tanstack/svelte-query'

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/svelte-query').QueryClient
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // General default config for extension data, can be overridden per query
      staleTime: 60 * 1000,
    },
  },
})

window.__TANSTACK_QUERY_CLIENT__ = queryClient
