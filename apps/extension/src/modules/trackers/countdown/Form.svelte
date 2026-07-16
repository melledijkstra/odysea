<script lang="ts">
  import Icon from '@/components/atoms/Icon.svelte'
  import Toggle from '@/components/atoms/Toggle.svelte'
  import { trackers } from '../state.svelte'
  import { mdiCalendarPlusOutline } from '@mdi/js'
  import Input from '@/components/atoms/Input.svelte'
  import Button from '@/components/atoms/Button.svelte'

  const { onSubmitted }: { onSubmitted?: () => void } = $props()

  let inputName = $state('')
  let inputDate = $state(getToday())
  let inputPinned = $state(false)

  function getToday(): string {
    return new Date().toISOString()?.split('T')[0]
  }

  function resetForm() {
    inputName = ''
    inputDate = getToday()
    inputPinned = false
  }
</script>

<form
  class="flex flex-col gap-4 text-left"
  onsubmit={(e) => {
    e.preventDefault()
    trackers.addCountdown(inputName, inputDate, inputPinned)
    onSubmitted?.()
    resetForm()
  }}
>
  <div class="space-y-3">
    <Input
      id="countdown-date"
      label="Date"
      type="date"
      required
      bind:value={inputDate}
    />
    <Input
      label="Name"
      placeholder="e.g. Vacation"
      required
      type="text"
      bind:value={inputName}
    />
    <Toggle bind:checked={inputPinned} label="Pin to Top Bar" />
  </div>
  <Button
    class="w-full justify-center mt-2"
    type="submit"
  >
    <Icon size={18} path={mdiCalendarPlusOutline} class="mr-2" /> Add Countdown
  </Button>
</form>
