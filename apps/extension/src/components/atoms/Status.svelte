<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  const { status = null, pinging, ...props }: {
    status: boolean | null
    pinging?: boolean
  } & HTMLAttributes<HTMLDivElement> = $props()
</script>

<div {...props} class={[
  'relative flex size-5',
  props.class,
]}>
  {#if pinging}
    <span class={[
      'absolute inline-flex h-full w-full animate-ping rounded-full',
      status === null
        ? 'bg-gray-400'
        : status ? 'bg-green-500' : 'bg-red-500',
    ]}></span>
  {/if}
  <span class={[
    'relative inline-flex h-full w-full rounded-full',
    'transition-colors shadow-center',
    status === null
      ? 'bg-gray-400 shadow-gray-300'
      : status ? 'bg-green-500 shadow-green-400' : 'bg-red-500 shadow-red-400',
  ]}></span>
</div>
