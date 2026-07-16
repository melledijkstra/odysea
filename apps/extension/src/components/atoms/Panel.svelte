<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type PanelProps = {
    children: Snippet
    nopadding?: boolean
    size?: 'small' | 'medium' | 'large'
  } & HTMLAttributes<HTMLDivElement>

  const { children, nopadding, size = 'medium', ...props }: PanelProps = $props()
</script>

<div
  {...props}
  class={[
    'flex flex-col',
    'rounded-xl shadow-md backdrop-blur-xs overflow-y-auto',
    'z-40',
    // size
    size === 'small' && 'w-[300px] max-h-[300px]',
    size === 'medium' && 'w-[500px] h-[400px]',
    size === 'large' && 'w-[650px] h-[500px]',
    !nopadding && 'p-4',
    // light theme
    'bg-white/40 text-black',
    // dark theme
    'dark:bg-black/60 dark:text-white',
    props.class,
  ]}
>
  {@render children()}
</div>
