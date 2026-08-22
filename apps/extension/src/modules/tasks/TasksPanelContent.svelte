<script lang="ts">
  import TaskList from '@/components/atoms/tasks/TaskList.svelte'
  import ScrollArea from '@melledijkstra/ui/svelte/ScrollArea.svelte'
  import type { TaskControllerInterface } from '@/controllers/TaskController.interface'
  import { useTasksQuery, useTasksListQuery } from '@/queries/tasks'
  import type { Task } from '@/modules/tasks/types'
  import { getAuthContext } from '@/oauth2/auth.state.svelte'
  import { TASKS_SCOPE } from '@/oauth2/scope-registry'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'

  const authState = getAuthContext()

  export type TasksPanelContentProps = {
    controller: TaskControllerInterface
    providerId: string
  }

  const { controller, providerId }: TasksPanelContentProps = $props()
  const queryClient = useQueryClient()

  const isEnabled = $derived(
    providerId === 'google'
      ? authState.hasScopes('google', [TASKS_SCOPE])
      : authState.hasScopes('github', ['repo'])
  )

  const taskListsQuery = useTasksListQuery(() => ({
    providerId,
    controller,
    enabled: isEnabled,
  }))

  let manualSelectedListId = $state<string | null>(null)
  let selectedTaskList = $derived(
    manualSelectedListId ??
      taskListsQuery.data?.[0]?.id ??
      controller.defaultListId ??
      ''
  )
  let newTaskTitle = $state('')

  $effect(() => {
    // Reset manual list selection when provider changes
    if (providerId) {
      manualSelectedListId = null
    }
  })

  const tasksQuery = useTasksQuery(() => ({
    providerId,
    controller,
    taskListId: selectedTaskList,
    enabled: isEnabled,
  }))

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['tasks', providerId, 'tasks', selectedTaskList],
    })

  const createTaskMutation = createMutation(() => ({
    mutationFn: (title: string) =>
      controller.createTask(title, selectedTaskList),
    onSuccess: invalidate,
  }))

  const setTaskStatusMutation = createMutation(() => ({
    mutationFn: ({ taskId, status }: { taskId: string; status: boolean }) =>
      controller.setTaskStatus(taskId, status, selectedTaskList),
    onSuccess: invalidate,
  }))

  const updateTaskMutation = createMutation(() => ({
    mutationFn: (task: Task) => controller.updateTask(task, selectedTaskList),
    onSuccess: invalidate,
  }))

  const deleteTaskMutation = createMutation(() => ({
    mutationFn: (taskId: string) =>
      controller.deleteTask(taskId, selectedTaskList),
    onSuccess: invalidate,
  }))
</script>

<h3 class="mb-2 flex items-center text-lg text-black dark:text-white">
  <select
    name="task-list-selector"
    class="w-full text-black dark:text-white text-lg bg-transparent border-none focus:outline-hidden"
    value={selectedTaskList}
    onchange={(e) => {
      manualSelectedListId = e.currentTarget.value
    }}
  >
    {#each taskListsQuery.data ?? [] as list (list.id)}
      <option value={list.id}>{list.title}</option>
    {/each}
  </select>
</h3>
<ScrollArea
  class="flex-1"
  scrollbarClasses="bg-transparent"
  orientation="vertical"
>
  <TaskList
    tasks={tasksQuery.data ?? []}
    onToggleTask={(taskId, status) =>
      setTaskStatusMutation.mutate({ taskId, status })}
    onSaveEdit={(task) => updateTaskMutation.mutate(task)}
    onRemoveTask={(taskId) => deleteTaskMutation.mutate(taskId)}
    isLoading={tasksQuery.isFetching}
  />
</ScrollArea>
{#if controller.canCreateTask}
  <input
    name="new-task-input"
    bind:value={newTaskTitle}
    onkeypress={(e) => {
      if (e.key === 'Enter' && newTaskTitle) {
        createTaskMutation.mutate(newTaskTitle)
        newTaskTitle = ''
      }
    }}
    class="mt-1 border-none outline-hidden text-sm bg-transparent dark:text-white"
    type="text"
    placeholder="New task"
  />
{:else}
  <p class="mt-1 text-xs text-gray-400">
    Task creation is not supported for this provider.
  </p>
{/if}
