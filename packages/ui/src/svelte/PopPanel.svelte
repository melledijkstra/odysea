<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Popover } from 'bits-ui'
  import type { PanelProps } from './Panel.svelte'
  import Panel from './Panel.svelte'

  export type PopPanelProps = {
    children: Snippet
    panelProps?: Omit<PanelProps, 'children'>
  } & Popover.ContentProps

  const { children, panelProps, ...props }: PopPanelProps = $props()
</script>

<Popover.Content sideOffset={8} collisionPadding={8} {...props}>
  {#snippet child({ wrapperProps, props: contentProps, open })}
    {#if open}
      <div {...wrapperProps}>
        <Popover.Arrow class={['dark:text-black/40 text-white/40']} />
        <Panel {...panelProps} {...contentProps}>
          {@render children()}
        </Panel>
      </div>
    {/if}
  {/snippet}
</Popover.Content>
