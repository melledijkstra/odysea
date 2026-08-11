<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'

  export type ButtonProps = HTMLButtonAttributes & {
    outline?: boolean
  }

  const { children, outline, ...props }: ButtonProps = $props()
</script>

<button
  {...props}
  type={props.type ?? 'button'}
  class={[
    'flex text-white focus:ring-4 focus:outline-hidden font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center cursor-pointer',
    'bg-primary hover:bg-primary/80 focus:ring-primary/50 dark:focus:ring-primary/55',
    outline
      ? 'box-border border-2 border-primary focus-visible:ring-4 focus:outline-hidden bg-transparent'
      : '',
    props.class,
  ]}
>
  {@render children?.()}
</button>
