<script lang="ts">
  import TaskList from '@/components/atoms/tasks/TaskList.svelte'
  import type { TaskControllerInterface } from '@/controllers/GoogleTasksController'
  import { onMount } from 'svelte'
  import type { GoogleTasksState } from './state.svelte'

  export type TasksPanelContentProps = {
    controller: TaskControllerInterface
    state: GoogleTasksState
  }

  const { controller, state: tasksState }: TasksPanelContentProps = $props()

  let selectedTaskList = $state<string>()
  let newTaskTitle = $state('')

  async function loadTaskLists() {
    const lists = await controller.getTaskLists()
    if (lists) {
      if (!selectedTaskList && lists.length > 0) {
        selectedTaskList = lists[0].id
        await controller.getTasks(selectedTaskList)
      }
    }
  }

  onMount(async () => {
    loadTaskLists()
  })
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
    onchange={() => controller.getTasks(selectedTaskList)}
  >
    {#each tasksState.taskLists as list (list.id)}
      <option value={list.id}>{list.title}</option>
    {/each}
  </select>
</h3>
<TaskList
  class="flex-1 overflow-y-auto"
  tasks={tasksState.tasks}
  onToggleTask={(taskId, status) =>
    controller.setTaskStatus(taskId, status, selectedTaskList)}
  onSaveEdit={(task) => controller.updateTask(task, selectedTaskList)}
  onRemoveTask={(taskId) => controller.deleteTask(taskId, selectedTaskList)}
/>
<input
  name="new-task-input"
  bind:value={newTaskTitle}
  onkeypress={(e) => {
    if (e.key === 'Enter' && newTaskTitle) {
      controller.createTask(newTaskTitle, selectedTaskList)
      newTaskTitle = ''
    }
  }}
  class="mt-1 border-none outline-hidden text-sm bg-transparent dark:text-white"
  type="text"
  placeholder="New task"
/>
