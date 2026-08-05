<script lang="ts">
  import TaskList from '@/components/atoms/tasks/TaskList.svelte'
  import type { TaskControllerInterface } from '@/controllers/GoogleTasksController'
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from '@tanstack/svelte-query'
  import type { Task } from '@melledijkstra/api'

  export type TasksPanelContentProps = {
    controller: TaskControllerInterface
  }

  const { controller }: TasksPanelContentProps = $props()
  const queryClient = useQueryClient()

  let selectedTaskList = $state<string>('@default')
  let newTaskTitle = $state('')

  const taskListsQuery = createQuery(() => ({
    queryKey: ['google-tasks', 'lists'],
    queryFn: async () => {
      const lists = await controller.getTaskLists()
      if (lists.length > 0 && !selectedTaskList) {
        selectedTaskList = lists[0].id
      }
      return lists
    },
    staleTime: 5 * 60 * 1000,
  }))

  const tasksQuery = createQuery(() => ({
    queryKey: ['google-tasks', 'tasks', selectedTaskList],
    queryFn: () => controller.getTasks(selectedTaskList),
    enabled: !!selectedTaskList,
    staleTime: 5 * 60 * 1000,
  }))

  const createTaskMutation = createMutation(() => ({
    mutationFn: (title: string) =>
      controller.createTask(title, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['google-tasks', 'tasks', selectedTaskList],
      }),
  }))

  const setTaskStatusMutation = createMutation(() => ({
    mutationFn: ({ taskId, status }: { taskId: string; status: boolean }) =>
      controller.setTaskStatus(taskId, status, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['google-tasks', 'tasks', selectedTaskList],
      }),
  }))

  const updateTaskMutation = createMutation(() => ({
    mutationFn: (task: Task) => controller.updateTask(task, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['google-tasks', 'tasks', selectedTaskList],
      }),
  }))

  const deleteTaskMutation = createMutation(() => ({
    mutationFn: (taskId: string) =>
      controller.deleteTask(taskId, selectedTaskList),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['google-tasks', 'tasks', selectedTaskList],
      }),
  }))
</script>

<h3 class="mb-2 flex items-center text-lg text-black dark:text-white">
  <img
    class="mr-2 size-5"
    src="icons/google-tasks.svg"
    alt="google task icon"
  />
  <select
    name="task-list-selector"
    class="w-full text-black dark:text-white text-lg"
    bind:value={selectedTaskList}
  >
    {#if taskListsQuery.data}
      {#each taskListsQuery.data as list, i (list.id)}
        {#if i === 0}
          <option value="@default" selected>{list.title}</option>
        {:else}
          <option value={list.id}>{list.title}</option>
        {/if}
      {/each}
    {/if}
  </select>
</h3>
<TaskList
  class="flex-1 overflow-y-auto"
  tasks={tasksQuery.data ?? []}
  onToggleTask={(taskId, status) =>
    setTaskStatusMutation.mutate({ taskId, status })}
  onSaveEdit={(task) => updateTaskMutation.mutate(task)}
  onRemoveTask={(taskId) => deleteTaskMutation.mutate(taskId)}
/>
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
