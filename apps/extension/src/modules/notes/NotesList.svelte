<script lang="ts">
  import Icon from '@/components/atoms/Icon.svelte'
  import { formatDate } from '@melledijkstra/toolbox'
  import type { Note } from '@/db/notes'
  import { mdiNote } from '@mdi/js'

  export type NotesListProps = {
    notes: Note[]
    onSelectNote: (note: Note | null) => void
  }

  const { notes, onSelectNote }: NotesListProps = $props()
</script>

<div class="flex flex-col gap-2">
  <button onclick={() => onSelectNote(null)} class="cursor-pointer">
    <span class="sr-only">Create new note</span>
    <Icon path={mdiNote} size={24} />
  </button>
  {#if notes.length === 0}
    <p class="text-sm text-gray-500">No notes created yet</p>
  {:else}
    <ul class="dark:text-white h-full overflow-y-auto">
      {#each notes as note (note.id)}
        <li class="flex flex-col gap-2">
          <button onclick={() => onSelectNote(note)} class="cursor-pointer text-left">
            <p class="text-base">{note.title}</p>
            <span class="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
