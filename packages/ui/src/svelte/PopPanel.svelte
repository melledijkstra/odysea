<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Popover } from 'bits-ui'
  import type { PanelProps } from './Panel.svelte'
  import Panel from './Panel.svelte'

  export type PopPanelProps = {
    children: Snippet
    panelProps?: Omit<PanelProps, 'children'>
  } & Popover.ContentProps

  const {
    children,
    panelProps,
    class: contentClass,
    ...props
  }: PopPanelProps = $props()
</script>

<Popover.Content
  forceMount
  sideOffset={8}
  collisionPadding={8}
  class={[
    contentClass,
    'transition-all duration-200 ease-linear',
    'data-[state=closed]:pointer-events-none',
    'data-[state=closed]:opacity-0 data-[state=closed]:scale-98',
    'data-[state=open]:opacity-100 data-[state=open]:scale-100',
  ]}
  {...props}
>
  <Popover.Arrow class={['dark:text-black/40 text-white/40']} />
  <Panel {...panelProps}>
    {@render children()}
  </Panel>
</Popover.Content>
