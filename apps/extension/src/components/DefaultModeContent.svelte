<script lang="ts">
  import { appState } from '@/app-state.svelte'
  import { storeUsername, clearUsername, retrieveUsername } from '@/browser'
  import Clock from '@/components/Clock.svelte'
  import Welcome from '@/components/Welcome.svelte'
  import { settingsStore } from '@/settings/index.svelte'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { onMount } from 'svelte'
  import { useTasksQuery } from '@/queries/tasks'
  import { GoogleTasksController } from '@/controllers/GoogleTasksController'

  const taskListId = '@default'

  const authState = getAuthContext()

  const tasksQuery = useTasksQuery(
    'google',
    new GoogleTasksController(),
    taskListId,
    authState.providers.google.isAuthenticated
  )

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
<Welcome user={appState.user} {onUsernameChange} {onClearUsername} />

<div class="mt-4 text-lg empty:h-7">
  {#if settingsStore.ui.showCurrentTask && currentTask}
    <input type="checkbox" class="scale-150 text-white mr-1" disabled />
    <span
      class="text-white text-lg antialiased drop-shadow-md text-shadow-lg/20"
      >{currentTask.title}</span
    >
  {/if}
</div>
