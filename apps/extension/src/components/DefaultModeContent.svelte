<script lang="ts">
  import Clock from '@/components/Clock.svelte'
  import Welcome from '@/components/Welcome.svelte'
  import { settingsStore } from '@/settings/index.svelte'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { useTasksQuery } from '@/queries/tasks'
  import { useAccountQuery } from '@/queries/account'
  import { GoogleTasksController } from '@/controllers/GoogleTasksController'
  import { TASKS_SCOPE } from '@/oauth2/scope-registry'

  const taskListId = '@default'

  const authState = getAuthContext()
  const accountQuery = useAccountQuery()

  const isTasksEnabled = $derived(
    settingsStore.ui.showCurrentTask &&
      authState.hasScopes('google', [TASKS_SCOPE])
  )

  const tasksQuery = useTasksQuery(() => ({
    providerId: 'google',
    controller: new GoogleTasksController(),
    taskListId,
    enabled: isTasksEnabled,
  }))

  const currentTask = $derived(
    tasksQuery.data?.find((task) => task.status === 'needsAction')
  )
</script>

<Clock />
<Welcome name={accountQuery.data?.given_name} />

<div class="mt-4 text-lg empty:h-7">
  {#if settingsStore.ui.showCurrentTask && currentTask}
    <input type="checkbox" class="scale-150 text-white mr-1" disabled />
    <span
      class="text-white text-lg antialiased drop-shadow-md text-shadow-lg/20"
      >{currentTask.title}</span
    >
  {/if}
</div>
