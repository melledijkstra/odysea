<script lang="ts">
  import type { Snippet } from 'svelte'
  import { ContextMenu, type WithoutChild } from 'bits-ui'

  export type ContextMenuProps = ContextMenu.RootProps & {
    open?: boolean
    heading?: string
    items: {
      label: string
      onSelect: (label: string) => void
    }[]
    triggerProps?: WithoutChild<ContextMenu.TriggerProps>
    contentProps?: WithoutChild<ContextMenu.ContentProps>
    children: Snippet
  }

  let {
    open = $bindable(false),
    children,
    heading,
    items,
    contentProps,
    triggerProps,
    ...restProps
  }: ContextMenuProps = $props()
</script>

<ContextMenu.Root bind:open {...restProps}>
  <ContextMenu.Trigger {...triggerProps}>
    {@render children()}
  </ContextMenu.Trigger>
  <ContextMenu.Portal>
    <ContextMenu.Content {...contentProps} class="menu">
      <ContextMenu.Group class="flex flex-col gap-1">
        {#if heading}
          <ContextMenu.GroupHeading
            class="dark:text-gray-400 text-sm font-bold px-2"
            >{heading}</ContextMenu.GroupHeading
          >
        {/if}
        {#each items as item (item.label)}
          <ContextMenu.Item
            onSelect={() => item.onSelect(item.label)}
            class="dark:text-white cursor-pointer focus:bg-gray-600 px-2 py-1 text-sm"
          >
            {item.label}
          </ContextMenu.Item>
        {/each}
      </ContextMenu.Group>
    </ContextMenu.Content>
  </ContextMenu.Portal>
</ContextMenu.Root>
