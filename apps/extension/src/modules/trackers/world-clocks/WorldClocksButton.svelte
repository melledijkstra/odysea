<script lang="ts">
  import { mdiWebClock } from '@mdi/js'
  import IconButton from '@/components/atoms/IconButton.svelte'
  import Form from './Form.svelte'

  let open: boolean = $state(false)

  function toggleDisplay() {
    if (open) {
      open = false
    }
    else {
      open = true
    }
  }
</script>

<div class="relative">
  <IconButton
    onclick={toggleDisplay}
    icon={mdiWebClock}
  />
  {#if open}
    <Form />
  {/if}
</div>
