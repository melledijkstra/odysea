<script lang="ts">
  import type { Note } from '@/db/notes'
  import NotesForm from './NotesForm.svelte'
  import NotesList from './NotesList.svelte'

  const { notes, onSubmitNote } = $props()

  let selectedNote: Note | null = $state(null)
</script>

<div class="flex flex-row gap-2">
  <NotesList notes={notes} onSelectNote={note => selectedNote = note} />
  {#if selectedNote}
    <div class="flex-1 flex flex-col gap-2 dark:text-white">
      <h1 class="text-lg">{selectedNote.title}</h1>
      <p class="text-sm">{selectedNote.text}</p>
    </div>
  {:else}
    <NotesForm onSubmitNote={onSubmitNote} />
  {/if}
</div>
