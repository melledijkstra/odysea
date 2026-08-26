<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  const {
    src,
    alt,
    class: className,
    imgProps,
    children,
  }: {
    src: string
    alt?: string
    class?: string
    imgProps?: HTMLAttributes<HTMLImageElement>
    children?: Snippet
  } = $props()
</script>

<p class={['text-xs flex gap-1 items-center', className]}>
  <img {...imgProps} {src} {alt} class={['size-3', imgProps?.class]} />
  {@render children?.()}
</p>
