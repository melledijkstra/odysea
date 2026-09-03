<script lang="ts">
  import Clock from '@/components/Clock.svelte'
  import Welcome from '@/components/Welcome.svelte'
  import { settingsStore } from '@/settings/index.svelte'
  import { authState } from '@/oauth2/auth.state.svelte'
  import { useTasksQuery, useTasksListQuery } from '@/queries/tasks'
  import { useAccountQuery } from '@/queries/account'
  import { GoogleTasksController } from '@/controllers/GoogleTasksController'
  import { TASKS_SCOPE } from '@/oauth2/scope-registry'

  const controller = new GoogleTasksController()

  const accountQuery = useAccountQuery()

  const isTasksEnabled = $derived(
    settingsStore.ui.showCurrentTask &&
      authState.hasScopes('google', [TASKS_SCOPE])
  )

  const taskListsQuery = useTasksListQuery(() => ({
    providerId: 'google',
    controller,
    enabled: isTasksEnabled,
  }))

  const tasksQuery = useTasksQuery(() => ({
    providerId: 'google',
    controller,
    taskListId: taskListsQuery.data?.[0]?.id ?? '',
    enabled: isTasksEnabled && !!taskListsQuery.data?.[0]?.id,
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
