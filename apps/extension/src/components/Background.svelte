<script lang="ts">
  import { background } from '@/stores/background.svelte'
  import { fade } from 'svelte/transition'

  const url = $derived(background.url)
</script>

<!-- Fallback Gradient Background -->
<div
  class="fixed inset-0 -z-30 bg-linear-to-br from-amber-900 via-slate-900 to-indigo-800"
  data-testid="background-gradient"
></div>

{#if url}
  {#key url}
    <div
      class="fixed inset-0 -z-20 bg-center bg-no-repeat bg-cover bg-fixed"
      style="background-image: url({url})"
      transition:fade={{ duration: 300 }}
      data-testid="background-image"
    ></div>
  {/key}
{/if}
