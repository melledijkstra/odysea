<script lang="ts">
  import type { Task } from '@/api/definitions/google'
  import ContextMenu from '@/components/atoms/ContextMenu.svelte'
  import Icon from '@/components/atoms/Icon.svelte'
  import { mdiDotsVertical } from '@mdi/js'
  import DropdownMenu from '../DropdownMenu.svelte'

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

<ContextMenu items={menuItems}>
  <div
    class="relative flex items-center gap-1 text-sm text-white hover:bg-gray-800 group/task rounded-md p-1"
  >
    <input
      type="checkbox"
      class="mr-1 self-start translate-y-1"
      onchange={e =>
        onToggleTask(task.id, (e.target as HTMLInputElement).checked)}
      checked={task.status === 'completed'}
    />
    {#if editMode}
      <input
        {@attach node => node.focus()}
        class="flex-1 bg-transparent border-b text-white"
        bind:value={editingTitle}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            onSaveEdit({ ...task, title: editingTitle })
            editMode = false
          }
          else if (e.key === 'Escape') {
            editMode = false
            e.stopPropagation()
          }
        }}
      />
    {:else}
      <button
        class="flex-1 text-left leading-[1em]"
        ondblclick={() => (editMode = true)}
      >
        {task.title}
      </button>
    {/if}
    <DropdownMenu
      items={menuItems}
      triggerProps={{
        class:
          'text-gray-400 bg-gray-800 rounded-full ml-auto p-1 invisible group-hover/task:visible',
      }}
    >
      <Icon path={mdiDotsVertical} size={16} />
    </DropdownMenu>
  </div>
</ContextMenu>
