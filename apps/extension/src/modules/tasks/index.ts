import type { Module } from '@/modules'
import TasksMenuItem from './TasksMenuItem.svelte'
import { GoogleTasksApiClient } from '@melledijkstra/api'
import { authState } from '@/oauth2/auth.state.svelte'
import { queryClient } from '@/queryClient'
import { TASKS_SCOPE } from '@/oauth2/scope-registry'

export default {
  component: TasksMenuItem,
  init: async () => {
    const client = new GoogleTasksApiClient(authState.clients.google)
    const isAuthenticated = await authState.clients.google.isAuthenticated()
    const hasScopes = await authState.clients.google.hasGrantedScopes([
      TASKS_SCOPE,
    ])

    if (isAuthenticated && hasScopes) {
      await queryClient.prefetchQuery({
        queryKey: ['tasks', 'google', 'lists'],
        queryFn: () => client.getTaskLists(),
      })
    }
  },
} satisfies Module
