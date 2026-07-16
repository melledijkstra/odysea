<script lang="ts">
  import Icon from '@/components/atoms/Icon.svelte'
  import Toggle from '@/components/atoms/Toggle.svelte'
  import { mdiClockPlusOutline } from '@mdi/js'
  import { trackers } from '../state.svelte'
  import Input from '@/components/atoms/Input.svelte'
  import Select from '@/components/atoms/Select.svelte'
  import Button from '@/components/atoms/Button.svelte'

  const { onSubmitted }: { onSubmitted?: () => void } = $props()

  let inputTimezone: string = $state('')
  let inputName: string = $state('')
  let inputPinned: boolean = $state(false)

  function resetForm() {
    inputName = ''
    inputTimezone = ''
    inputPinned = false
  }
</script>

<form
  class="flex flex-col gap-4 text-left"
  onsubmit={(e) => {
    e.preventDefault()
    trackers.addWorldClock(inputName, inputTimezone, inputPinned)
    onSubmitted?.()
    resetForm()
  }}
>
  <div class="space-y-3">
    <Select
      id="timezone-select"
      required
      bind:value={inputTimezone}
      options={Intl.supportedValuesOf('timeZone').map(tz => ({
        value: tz,
        label: tz.replace(/_/g, ' '),
      }))}
      placeholder="Select timezone"
      label="Timezone"
    />
    <Input
      id="world-clock-name"
      label="Name"
      placeholder="e.g. London"
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
    <Icon size={18} path={mdiClockPlusOutline} class="mr-2" /> Add Clock
  </Button>
</form>
