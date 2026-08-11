<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type PanelProps = {
    children: Snippet
    nopadding?: boolean
    size?: 'small' | 'medium' | 'large'
    blur?: boolean
  } & HTMLAttributes<HTMLDivElement>

  const {
    children,
    nopadding,
    size = 'medium',
    blur = true,
    ...props
  }: PanelProps = $props()
</script>

<div
  {...props}
  class={[
    'flex flex-col',
    'rounded-xl shadow-md overflow-y-auto scrollbar',
    blur && 'backdrop-blur-xl',
    'z-40',
    size === 'small' && 'w-75 max-h-75',
    size === 'medium' && 'w-125 h-100',
    size === 'large' && 'w-162 h-125',
    !nopadding && 'p-4',
    'bg-white/40 text-black',
    'dark:bg-black/60 dark:text-white',
    props.class,
  ]}
>
  {@render children()}
</div>
