<script lang="ts">
  import { notes } from '@/stores/notes.svelte'
  import NotesPanelContent from './NotesPanelContent.svelte'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import type { Note } from '@/db/notes'
  import { NotesController } from './NotesController'
  import type { Insertable } from '@melledijkstra/storage'

  const controller = new NotesController(notes)

  function onSubmitNote(note: Insertable<Note>) {
    controller.addNote(note)
  }
</script>

<PopPanel>
  <NotesPanelContent notes={notes.items} {onSubmitNote} />
</PopPanel>
