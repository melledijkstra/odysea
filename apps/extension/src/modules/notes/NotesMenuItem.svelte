<script>
  import { Popover } from 'bits-ui'
  import { onMount } from 'svelte'
  import { notes } from '@/stores/notes.svelte'
  import NotesPanel from './NotesPanel.svelte'

  onMount(async () => {
    notes.initialize()
  })
</script>

<Popover.Root>
  <Popover.Trigger
    class="text-slate-200 hover:text-white text-lg capitalize cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden rounded-sm px-1"
  >
    Notes
  </Popover.Trigger>
  <NotesPanel />
</Popover.Root>
