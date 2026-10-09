<script lang="ts">
  import { Popover } from 'bits-ui'
  import TasksPanel from './TasksPanel.svelte'
</script>

<Popover.Root>
  <Popover.Trigger
    class="text-slate-200 hover:text-white text-lg capitalize cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden rounded-sm px-1"
  >
    Tasks
  </Popover.Trigger>
  <TasksPanel />
</Popover.Root>
