<script lang="ts">
  import type { Task } from '@/interfaces/tasks'
  import TaskItem from './TaskItem.svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import Spinner from '@/components/atoms/Spinner.svelte'

  export type TaskListProps = {
    tasks: Task[]
    onSaveEdit: (task: Task) => void
    onRemoveTask: (taskId: string) => void
    onToggleTask: (taskId: string, status: boolean) => void
    isLoading?: boolean
  } & HTMLAttributes<HTMLUListElement>

  const {
    tasks,
    onSaveEdit,
    onRemoveTask,
    onToggleTask,
    isLoading,
    ...props
  }: TaskListProps = $props()
</script>

{#if isLoading}
  <div class="flex justify-center p-4">
    <Spinner class="text-gray-400" />
  </div>
{:else if tasks.length === 0}
  <div class="mt-3 text-center text-xs text-gray-400">
    ✨ Add a task to get started ✨
  </div>
{:else}
  <ul {...props}>
    {#each tasks as task (task.id)}
      <li>
        <TaskItem {task} {onToggleTask} {onRemoveTask} {onSaveEdit} />
      </li>
    {/each}
  </ul>
{/if}
