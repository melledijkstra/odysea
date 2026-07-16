<script lang="ts">
  import {
    mdiCalendarOutline,
  } from '@mdi/js'
  import IconButton from '@/components/atoms/IconButton.svelte'
  import Form from './Form.svelte'

  const props = $props()

  let open: boolean = $state(false)

  function toggleDisplay() {
    open = !open
  }
</script>

<div class="relative {props.class}">
  <IconButton
    onclick={toggleDisplay}
    icon={mdiCalendarOutline}
  />
  {#if open}
    <Form />
  {/if}
</div>
