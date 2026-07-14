<script lang="ts">
  import { background } from '@/stores/background.svelte'
  import { fade } from 'svelte/transition'

  const url = $derived(background.url)
</script>

{#if url}
  {#key url}
    <div
      class="fixed inset-0 -z-20 bg-center bg-no-repeat bg-cover bg-fixed"
      style="background-image: url({url})"
      transition:fade={{ duration: 300 }}
    ></div>
  {/key}
{/if}
