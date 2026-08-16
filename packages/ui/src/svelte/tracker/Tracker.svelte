<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { ClassValue } from 'svelte/elements'

  interface TrackerProps {
    class?: ClassValue
    children?: Snippet
  }

  let { class: className, children }: TrackerProps = $props()
</script>

<div class={['dark:text-white text-black', className]}>
  {@render children?.()}
</div>
