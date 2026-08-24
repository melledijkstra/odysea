<script lang="ts">
  import type { Task } from '@/modules/tasks/types'
  import ContextMenu from '@melledijkstra/ui/svelte/ContextMenu.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import { mdiDotsVertical, mdiOpenInNew } from '@mdi/js'
  import DropdownMenu from '@melledijkstra/ui/svelte/DropdownMenu.svelte'

  export type TaskItemProps = {
    open?: boolean
    task: Task
    onToggleTask: (taskId: string, status: boolean) => void
    onRemoveTask: (taskId: string) => void
    onSaveEdit: (task: Task) => void
  }

  const {
    open = $bindable(false),
    task,
    onToggleTask,
    onRemoveTask,
    onSaveEdit,
  }: TaskItemProps = $props()

  const menuItems = [
    { label: 'Edit', onSelect: () => (editMode = true) },
    { label: 'Delete', onSelect: () => onRemoveTask(task.id) },
  ]

  let editingTitle = $derived(task.title)
  let editMode = $state(false)
</script>

<ContextMenu items={menuItems} {open}>
  <div
    class="relative flex items-center gap-1 text-sm text-white hover:bg-gray-800 group/task rounded-md p-1"
  >
    <input
      type="checkbox"
      class="mr-1 self-start translate-y-1"
      title="Toggle task completion"
      aria-label={`Toggle task completion for ${task.title}`}
      onchange={(e) =>
        onToggleTask(task.id, (e.target as HTMLInputElement).checked)}
      checked={task.status === 'completed'}
    />
    {#if editMode}
      <input
        {@attach (node) => node.focus()}
        class="flex-1 bg-transparent border-b text-white"
        title="Press Enter to save, Escape to cancel"
        aria-label="Edit task title"
        bind:value={editingTitle}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            onSaveEdit({ ...task, title: editingTitle })
            editMode = false
          } else if (e.key === 'Escape') {
            editMode = false
            e.stopPropagation()
          }
        }}
      />
    {:else}
      <button
        class="flex-1 text-left leading-[1em]"
        title="Double-click to edit"
        aria-label={`Edit task: ${task.title}`}
        ondblclick={() => (editMode = true)}
      >
        {task.title}
      </button>
    {/if}
    {#if task.webViewLink}
      <a
        href={task.webViewLink}
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-400 hover:text-white ml-auto invisible group-hover/task:visible p-1"
        title="Open link"
      >
        <Icon path={mdiOpenInNew} size={16} />
      </a>
    {/if}
    <DropdownMenu
      items={menuItems}
      triggerProps={{
        class:
          'text-gray-400 bg-gray-800 rounded-full ml-auto p-1 invisible group-hover/task:visible',
        title: 'Task options',
        'aria-label': `Task options for ${task.title}`,
      }}
    >
      <Icon path={mdiDotsVertical} size={16} />
    </DropdownMenu>
  </div>
</ContextMenu>
