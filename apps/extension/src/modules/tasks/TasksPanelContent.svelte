<script lang="ts">
  import TaskList from '@/components/atoms/tasks/TaskList.svelte'
  import ScrollArea from '@melledijkstra/ui/svelte/ScrollArea.svelte'
  import type { TaskControllerInterface } from '@/controllers/GoogleTasksController'
  import { createMutation, useQueryClient } from '@tanstack/svelte-query'
  import { useTasksQuery, useTasksListQuery } from '@/queries/tasks'
  import type { Task } from '@/interfaces/tasks'

  export type TasksPanelContentProps = {
    controller: TaskControllerInterface
    providerId: string
  }

  const { controller, providerId }: TasksPanelContentProps = $props()
  const queryClient = useQueryClient()

  let manualSelectedListId = $state<string | null>(null)
  let selectedTaskList = $derived(
    manualSelectedListId ?? controller.defaultListId ?? ''
  )
  let newTaskTitle = $state('')

  const taskListsQuery = useTasksListQuery(() => ({
    providerId,
    controller,
  }))

  const tasksQuery = useTasksQuery(() => ({
    providerId,
    controller,
    taskListId: selectedTaskList,
  }))

  const createTaskMutation = createMutation(() => ({
    mutationFn: (title: string) =>
      controller.createTask(title, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tasks', providerId, 'tasks', selectedTaskList],
      }),
  }))

  const setTaskStatusMutation = createMutation(() => ({
    mutationFn: ({ taskId, status }: { taskId: string; status: boolean }) =>
      controller.setTaskStatus(taskId, status, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tasks', providerId, 'tasks', selectedTaskList],
      }),
  }))

  const updateTaskMutation = createMutation(() => ({
    mutationFn: (task: Task) => controller.updateTask(task, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tasks', providerId, 'tasks', selectedTaskList],
      }),
  }))

  const deleteTaskMutation = createMutation(() => ({
    mutationFn: (taskId: string) =>
      controller.deleteTask(taskId, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tasks', providerId, 'tasks', selectedTaskList],
      }),
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
    {#if taskListsQuery.data}
      {#each taskListsQuery.data as list, i (list.id)}
        <option
          value={i === 0 && controller.defaultListId
            ? controller.defaultListId
            : list.id}>{list.title}</option
        >
      {/each}
    {/if}
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
