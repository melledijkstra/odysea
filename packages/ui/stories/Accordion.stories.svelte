<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { Accordion } from '../src/svelte'

  const { Story } = defineMeta({
    title: 'Components/Accordion',
    component: Accordion,
    argTypes: {
      type: {
        control: { type: 'select' },
        options: ['single', 'multiple'],
        description:
          'Determines whether one or multiple items can be opened at the same time.',
      },
    },
  })
</script>

<Story name="Single">
  <div class="mx-auto w-full max-w-md p-4">
    <Accordion
      type="single"
      items={[
        {
          id: 'item-1',
          title: 'Is it accessible?',
        },
        {
          id: 'item-2',
          title: 'Is it styled?',
        },
        {
          id: 'item-3',
          title: 'Is it animated?',
        },
      ]}
    >
      {#snippet children(item)}
        {#if item.id === 'item-1'}
          Yes. It adheres to the WAI-ARIA design pattern.
        {:else if item.id === 'item-2'}
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        {:else if item.id === 'item-3'}
          Yes. It's animated by default, but you can disable it if you prefer.
        {/if}
      {/snippet}
    </Accordion>
  </div>
</Story>

<Story name="Multiple">
  <div class="mx-auto w-full max-w-md p-4">
    <Accordion
      type="multiple"
      items={[
        {
          id: 'item-1',
          title: 'Can I open multiple?',
        },
        {
          id: 'item-2',
          title: 'What about this one?',
        },
        {
          id: 'item-3',
          title: 'Or this one?',
        },
      ]}
    >
      {#snippet children(item)}
        {#if item.id === 'item-1'}
          Yes! By passing `type="multiple"` you can open as many items as you
          want.
        {:else if item.id === 'item-2'}
          You can open this one too while the other is open.
        {:else if item.id === 'item-3'}
          And this one as well. Feel free!
        {/if}
      {/snippet}
    </Accordion>
  </div>
</Story>

<Story name="With Disabled Items">
  <div class="mx-auto w-full max-w-md p-4">
    <Accordion
      type="single"
      items={[
        {
          id: 'item-1',
          title: 'Available Item',
        },
        {
          id: 'item-2',
          title: 'Disabled Item',
          disabled: true,
        },
        {
          id: 'item-3',
          title: 'Another Available Item',
        },
      ]}
    >
      {#snippet children(item)}
        This is the content for {item.title}.
      {/snippet}
    </Accordion>
  </div>
</Story>
