<script lang="ts" module>
  import type { Snippet } from 'svelte'

  interface TrackerProps {
    class?: string
    children?: Snippet
  }
</script>

<script lang="ts">
  const { class: className, children }: TrackerProps = $props()
</script>

<div class={['dark:text-white text-black', className]}>
  {@render children?.()}
</div>
