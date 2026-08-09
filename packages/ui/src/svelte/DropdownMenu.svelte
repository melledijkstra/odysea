<script lang="ts">
  import type { Snippet } from 'svelte'
  import { DropdownMenu, type WithoutChild } from 'bits-ui'

  export type DropdownMenuProps = DropdownMenu.RootProps & {
    open?: boolean
    items: {
      label: string
      onSelect: (label: string) => void
    }[]
    children: Snippet
    heading?: string
    triggerProps?: WithoutChild<DropdownMenu.TriggerProps>
    contentProps?: WithoutChild<DropdownMenu.ContentProps>
  }

  let {
    open = $bindable(false),
    items,
    children,
    triggerProps,
    contentProps,
    heading,
    ...restProps
  }: DropdownMenuProps = $props()
</script>

<DropdownMenu.Root bind:open {...restProps}>
  <DropdownMenu.Trigger {...triggerProps}>
    {@render children()}
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content {...contentProps} class="menu">
      <DropdownMenu.Group class="flex flex-col gap-1">
        {#if heading}
          <DropdownMenu.GroupHeading class="menu-group-heading"
            >{heading}</DropdownMenu.GroupHeading
          >
        {/if}
        {#each items as item (item.label)}
          <DropdownMenu.Item
            textValue={item.label}
            onSelect={() => item.onSelect(item.label)}
            class="menu-item"
          >
            {item.label}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Group>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
