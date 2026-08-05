<script lang="ts">
  import { appState } from '@/app-state.svelte'
  import { storeUsername, clearUsername, retrieveUsername } from '@/browser'
  import Clock from '@/components/Clock.svelte'
  import Welcome from '@/components/Welcome.svelte'
  import { GoogleAuthProvider } from '@/oauth2/providers'
  import { settingsStore } from '@/settings/index.svelte'
  import { GoogleTasksApiClient } from '@melledijkstra/api'
  import { AuthClient } from '@melledijkstra/extension'
  import { createQuery } from '@tanstack/svelte-query'
  import { onMount } from 'svelte'

  const taskListId = '@default'

  const tasksQuery = createQuery(() => ({
    queryKey: ['google-tasks', 'tasks', taskListId],
    queryFn: async () => {
      const auth = new AuthClient(new GoogleAuthProvider())
      const isAuthenticated = await auth.isAuthenticated()
      if (!isAuthenticated) return []
      const client = new GoogleTasksApiClient(auth)
      return (await client.fetchTasks(taskListId)) ?? []
    },
    staleTime: 5 * 60 * 1000,
  }))

  const currentTask = $derived(
    tasksQuery.data?.find((task) => task.status === 'needsAction')
  )

  function onUsernameChange(name: string) {
    storeUsername(name)
    appState.user = {
      name,
    }
  }

  function onClearUsername() {
    clearUsername()
    appState.user = undefined
  }

  onMount(async () => {
    const username = await retrieveUsername()
    if (username) {
      appState.user = {
        name: username,
      }
    }
  })
</script>

<Clock />
{#if appState?.user}
  <Welcome user={appState.user} {onUsernameChange} {onClearUsername} />
{/if}

<div class="mt-4 text-lg empty:h-7">
  {#if settingsStore.ui.showCurrentTask && currentTask}
    <input type="checkbox" class="scale-150 text-white mr-1" disabled />
    <span
      class="text-white text-lg antialiased drop-shadow-md text-shadow-lg/20"
      >{currentTask.title}</span
    >
  {/if}
</div>
