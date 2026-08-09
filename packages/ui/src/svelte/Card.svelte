<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type CardProps = {
    children: Snippet
    nopadding?: boolean
    variant?: 'square' | 'rectangular' | 'auto'
  } & HTMLAttributes<HTMLElement>

  const {
    children,
    nopadding,
    variant = 'square',
    class: className,
    ...props
  }: CardProps = $props()
</script>

<div
  class={[
    'block bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden',
    'text-black dark:text-white',
    variant === 'square' && 'aspect-square',
    variant === 'rectangular' && 'aspect-2/1',
    variant === 'auto' && 'aspect-auto',
    !nopadding && 'p-6',
    className,
  ]}
  {...props}
>
  {@render children?.()}
</div>
