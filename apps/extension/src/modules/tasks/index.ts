import type { Module } from '@/modules'
import TasksMenuItem from './TasksMenuItem.svelte'
import { GoogleTasksApiClient } from '@melledijkstra/api'
import { googleAuthClient } from '@/oauth2/clients'
import { queryClient } from '@/queryClient'
import { TASKS_SCOPE } from '@/oauth2/scope-registry'

export default {
  component: TasksMenuItem,
  init: async () => {
    const client = new GoogleTasksApiClient(googleAuthClient)
    const isAuthenticated = await googleAuthClient.isAuthenticated()
    const hasScopes = await googleAuthClient.hasGrantedScopes([TASKS_SCOPE])

    if (isAuthenticated && hasScopes) {
      await queryClient.prefetchQuery({
        queryKey: ['tasks', 'google', 'lists'],
        queryFn: () => client.getTaskLists(),
      })
    }
  },
} satisfies Module
