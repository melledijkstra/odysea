<script lang="ts">
  import type { Snippet } from 'svelte'

  const { children }: { children?: Snippet } = $props()
</script>

<p class="text-xs truncate leading-tight">
  {@render children?.()}
</p>
