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

<Popover.Portal>
  <Popover.Content
    sideOffset={8}
    collisionPadding={8}
    class={[
      contentClass,
      'backdrop-blur-xl z-20',
      'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      'data-[state=open]:animate-duration-100 data-[state=closed]:animate-duration-100',
    ]}
    {...props}
  >
    <Popover.Arrow class={['dark:text-black/40 text-white/40']} />
    <Panel blur={false} {...panelProps}>
      {@render children()}
    </Panel>
  </Popover.Content>
</Popover.Portal>
