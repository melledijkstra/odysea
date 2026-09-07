<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { Accordion } from '../src/svelte'

  const defaultItems = [
    {
      id: 'item-1',
      title: 'Is it accessible?',
      content: 'Yes. It adheres to the WAI-ARIA design pattern.',
    },
    {
      id: 'item-2',
      title: 'Is it styled?',
      content:
        "Yes. It comes with default styles that matches the other components' aesthetic.",
    },
    {
      id: 'item-3',
      title: 'Is it animated?',
      content:
        "Yes. It's animated by default, but you can disable it if you prefer.",
    },
  ]

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
    args: {
      type: 'single',
      items: defaultItems,
    },
  })
</script>

<Story name="Single" args={{ type: 'single' }} />

<Story name="Multiple" args={{ type: 'multiple' }} />

<Story
  name="With Disabled Items"
  args={{
    items: [
      ...defaultItems,
      {
        id: 'disabled-item-1',
        title: 'Disabled Item',
        content: "You can't open this one.",
        disabled: true,
      },
    ],
  }}
/>
