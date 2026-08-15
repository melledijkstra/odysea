<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import { trackers } from '../state.svelte'
  import { mdiNumeric } from '@mdi/js'
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import Button from '@melledijkstra/ui/svelte/Button.svelte'

  const { onSubmitted }: { onSubmitted?: () => void } = $props()

  let inputName = $state('')
  let inputPinned = $state(false)

  function resetForm() {
    inputName = ''
    inputPinned = false
  }
</script>

<form
  class="flex flex-col gap-4 text-left"
  onsubmit={(e) => {
    e.preventDefault()
    trackers.addCounter(inputName, 0, inputPinned)
    onSubmitted?.()
    resetForm()
  }}
>
  <div class="space-y-3">
    <Input
      label="Name"
      placeholder="e.g. Cups of Coffee"
      required
      type="text"
      bind:value={inputName}
    />
    <Toggle bind:checked={inputPinned} label="Pin to Top Bar" />
  </div>
  <Button class="w-full justify-center mt-2" type="submit">
    <Icon size={18} path={mdiNumeric} class="mr-2" /> Add Counter
  </Button>
</form>
