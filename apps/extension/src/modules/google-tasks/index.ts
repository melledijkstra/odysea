import type { Module } from '@/modules'
import TasksMenuItem from './TasksMenuItem.svelte'
import { GoogleTasksApiClient } from '@/api/google/tasks'
import { GoogleAuthProvider } from '@/oauth2/providers'
import { AuthClient } from '@melledijkstra/extension'
import { state } from './state.svelte'

export default {
  component: TasksMenuItem,
  init: async () => {
    const auth = new AuthClient(new GoogleAuthProvider())
    const client = new GoogleTasksApiClient(auth)
    state.tasks = await client.fetchTasks()
  }
} satisfies Module
