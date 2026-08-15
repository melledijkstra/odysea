<script lang="ts">
  import type { Snippet } from 'svelte'

  const { children }: { children?: Snippet } = $props()
</script>

<p class="text-base truncate">
  {@render children?.()}
</p>
