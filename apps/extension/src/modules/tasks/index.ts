import type { Module } from '@/modules'
import TasksMenuItem from './TasksMenuItem.svelte'
import { GoogleTasksApiClient } from '@melledijkstra/api'
import { GoogleAuthProvider } from '@/oauth2/providers'
import { AuthClient } from '@melledijkstra/extension'
import { queryClient } from '@/queryClient'

export default {
  component: TasksMenuItem,
  init: async () => {
    const auth = new AuthClient(new GoogleAuthProvider())
    const client = new GoogleTasksApiClient(auth)
    await queryClient.prefetchQuery({
      queryKey: ['google-tasks', 'lists'],
      queryFn: () => client.getTaskLists(),
    })
  },
} satisfies Module
