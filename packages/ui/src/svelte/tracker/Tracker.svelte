<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type TrackerProps = {
    class?: HTMLAttributes<HTMLDivElement>['class']
    children?: Snippet
  } & HTMLAttributes<HTMLDivElement>

  let { class: className, children, ...props }: TrackerProps = $props()
</script>

<div
  class={[
    'group/tracker relative inline-block dark:text-white text-black px-1 rounded',
    props?.onclick
      ? 'cursor-pointer hover:bg-neutral-800/40 transition-colors'
      : '',
    className,
  ]}
  {...props}
>
  {@render children?.()}
</div>
