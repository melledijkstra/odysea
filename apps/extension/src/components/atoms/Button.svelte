<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'

  const {
    children,
    ...props
  }: HTMLButtonAttributes = $props()
</script>

<button
  {...props}
  type={props.type ?? 'button'}
  class={[
    'flex text-white focus:ring-4 focus:outline-hidden font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center me-2 mb-2 cursor-pointer',
    'bg-primary hover:bg-primary/80 focus:ring-primary/50 dark:focus:ring-primary/55',
    props.class,
  ]}
>
  {@render children?.()}
</button>
