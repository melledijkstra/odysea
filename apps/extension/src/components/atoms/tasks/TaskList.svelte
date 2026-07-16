<script lang="ts">
  import type { Task } from '@/api/definitions/google'
  import TaskItem from './TaskItem.svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type TaskListProps = {
    tasks: Task[]
    onSaveEdit: (task: Task) => void
    onRemoveTask: (taskId: string) => void
    onToggleTask: (taskId: string, status: boolean) => void
  } & HTMLAttributes<HTMLUListElement>

  const {
    tasks,
    onSaveEdit,
    onRemoveTask,
    onToggleTask,
    ...props
  }: TaskListProps = $props()
</script>

{#if tasks.length === 0}
  <div class="mt-3 text-center text-xs text-gray-400">✨ Add a task to get started ✨</div>
{:else}
  <ul {...props}>
    {#each tasks as task (task.id)}
      <li>
        <TaskItem
          task={task}
          onToggleTask={onToggleTask}
          onRemoveTask={onRemoveTask}
          onSaveEdit={onSaveEdit}
        />
      </li>
    {/each}
  </ul>
{/if}
