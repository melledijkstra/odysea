<script lang="ts">
  import Button from '@/components/atoms/Button.svelte'
  import Input from '@/components/atoms/Input.svelte'
  import type { Note } from '@/db/notes'
  import type { Insertable } from '@melledijkstra/storage'

  const { onSubmitNote }: { onSubmitNote: (note: Insertable<Note>) => void } = $props()

  let inputTitle = $state('')
  let inputText = $state('')

  function onClick() {
    const note: Insertable<Note> = {
      title: inputTitle,
      text: inputText,
    }
    onSubmitNote(note)
    inputTitle = ''
    inputText = ''
  }
</script>

<div class="flex-1 flex flex-col gap-2">
  <h3 class="text-lg text-white">Create quick note</h3>
  <Input type="text" placeholder="Note Title" bind:value={inputTitle} />
  <textarea
    class="block p-2.5 w-full  text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    rows="4"
    placeholder="Write your thoughts here..."
    bind:value={inputText}
  >
  </textarea>
  <Button class="block text-white" onclick={onClick}>Save</Button>
</div>
