<script lang="ts">
  import { ScrollArea, type WithoutChild } from 'bits-ui'

  type Props = WithoutChild<ScrollArea.RootProps> & {
    orientation: 'vertical' | 'horizontal' | 'both'
    viewportClasses?: string
    scrollbarClasses?: string
    thumbClasses?: string
  }

  let {
    ref = $bindable(null),
    orientation = 'vertical',
    viewportClasses,
    scrollbarClasses,
    thumbClasses,
    children,
    ...restProps
  }: Props = $props()
</script>

{#snippet Scrollbar({
  orientation,
}: {
  orientation: 'vertical' | 'horizontal'
})}
  <ScrollArea.Scrollbar {orientation} class={[
    'bg-gray-100 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in flex w-1 touch-none select-none rounded-full transition-all duration-200',
    'hover:bg-gray-200 hover:w-2',
    scrollbarClasses,
  ]}>
    <ScrollArea.Thumb class={[
      'bg-gray-500 flex-1 rounded-full',
      thumbClasses,
    ]} />
  </ScrollArea.Scrollbar>
{/snippet}

<ScrollArea.Root bind:ref scrollHideDelay={10} {...restProps} class={[
  'relative overflow-hidden',
  restProps.class,
]}>
  <ScrollArea.Viewport class={[
    'h-full w-full',
    viewportClasses,
  ]}>
    {@render children?.()}
  </ScrollArea.Viewport>
  {#if orientation === 'vertical' || orientation === 'both'}
    {@render Scrollbar({ orientation: 'vertical' })}
  {/if}
  {#if orientation === 'horizontal' || orientation === 'both'}
    {@render Scrollbar({ orientation: 'horizontal' })}
  {/if}
  <ScrollArea.Corner />
</ScrollArea.Root>
