<script lang="ts">
  import { Popover } from 'bits-ui'
  import TasksPanel from './TasksPanel.svelte'
</script>

<Popover.Root>
  <Popover.Trigger class='text-slate-200 hover:text-white text-lg capitalize cursor-pointer'>
    Tasks
  </Popover.Trigger>
  <TasksPanel />
</Popover.Root>
