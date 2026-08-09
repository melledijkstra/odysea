import type { Module } from '@/modules'
import TasksMenuItem from './TasksMenuItem.svelte'
import { GoogleTasksApiClient } from '@melledijkstra/api'
import { googleAuthClient } from '@/oauth2/clients'
import { queryClient } from '@/queryClient'

export default {
  component: TasksMenuItem,
  init: async () => {
    const client = new GoogleTasksApiClient(googleAuthClient)
    await queryClient.prefetchQuery({
      queryKey: ['tasks', 'google', 'lists'],
      queryFn: () => client.getTaskLists(),
    })
  },
} satisfies Module
