<script lang="ts">
  import { notes } from '@/stores/notes.svelte'
  import NotesPanelContent from './NotesPanelContent.svelte'
  import PopPanel from '@/components/atoms/PopPanel.svelte'
  import type { Note } from '@/db/notes'
  import { NotesController } from './NotesController'

  const controller = new NotesController(notes)

  function onSubmitNote(note: Note) {
    controller.addNote(note)
  }
</script>

<PopPanel class="overflow-auto">
  <NotesPanelContent notes={notes.items} onSubmitNote={onSubmitNote} />
</PopPanel>
