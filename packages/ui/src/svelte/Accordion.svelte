<script lang="ts">
  import { Accordion } from 'bits-ui'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  export type AccordionItemData = {
    id: string
    title: string
    disabled?: boolean
  }

  // Need separate types because bits-ui types discriminate on type prop
  type BaseProps = {
    items: AccordionItemData[]
    children: Snippet<[AccordionItemData]>
    class?: string
  } & Omit<HTMLAttributes<HTMLElement>, 'children'>

  export type AccordionProps = BaseProps &
    (
      | { type?: 'single'; value?: string }
      | { type: 'multiple'; value?: string[] }
    )

  let {
    items,
    children,
    type = 'single',
    value = $bindable(),
    class: className,
    ...props
  }: AccordionProps = $props() as BaseProps & { type?: "single"; value?: string }
</script>

<Accordion.Root bind:value {type} class={['w-full', className]} {...props}>
  {#each items as item (item.id)}
    <Accordion.Item
      value={item.id}
      disabled={item.disabled}
      class="border-b border-gray-200 dark:border-gray-800 last:border-0"
    >
      <Accordion.Header>
        <Accordion.Trigger
          class="flex w-full flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=open]>svg]:rotate-180"
        >
          {item.title}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content
        class="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      >
        <div class="pb-4 pt-0 text-gray-700 dark:text-gray-300">
          {@render children(item)}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  {/each}
</Accordion.Root>
