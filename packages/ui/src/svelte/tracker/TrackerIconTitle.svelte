<script lang="ts">
  import type { Snippet } from 'svelte'

  const {
    src,
    alt,
    class: className,
    children,
  }: {
    src: string
    alt?: string
    class?: string
    children?: Snippet
  } = $props()
</script>

<p class={['text-xs flex gap-1 items-center', className]}>
  <img {src} {alt} class="w-3 h-3" />
  {@render children?.()}
</p>
