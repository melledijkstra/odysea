<script module lang="ts">
  import type { Snippet } from 'svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { Tracker } from '@/svelte/tracker'
  import type { ClassValue } from 'svelte/elements'
  import DinoIcon from '../icons/dino.svg'
  import ScaleIcon from '../icons/scale.svg'

  type TrackerProps = {
    class?: ClassValue
    children?: Snippet
    metric?: string | number
    title?: string
  }

  let weight = $state(68)

  const { Story } = defineMeta({
    title: 'Atoms/Tracker',
    args: {
      metric: 42,
      title: 'Example Tracker',
    },
  })
</script>

{#snippet template(args: TrackerProps)}
  <Tracker.Root {...args}>
    <Tracker.Metric>{args.metric}</Tracker.Metric>
    <Tracker.Title>{args.title}</Tracker.Title>
  </Tracker.Root>
{/snippet}

<Story name="Default" {template} />

<Story
  name="World Clock"
  args={{ metric: '14:23', title: 'Amsterdam' }}
  {template}
/>

<Story name="Counter" args={{ metric: 40, title: 'Pushups' }} {template} />

<Story
  name="Date countdown"
  args={{ metric: '14d', title: 'Vacation' }}
  {template}
/>

<Story name="With icon" args={{ metric: '5 Dinos', title: "Dino's Captured" }}>
  {#snippet template(args: TrackerProps)}
    <Tracker.Root {...args}>
      <Tracker.Metric>{args.metric}</Tracker.Metric>
      <Tracker.IconTitle src={DinoIcon}>{args.title}</Tracker.IconTitle>
    </Tracker.Root>
  {/snippet}
</Story>

<Story name="With actions">
  {#snippet template()}
    <Tracker.Root>
      <Tracker.Metric>{`${weight} kg`}</Tracker.Metric>
      <Tracker.IconTitle src={ScaleIcon} imgProps={{ class: 'size-4' }}
        >Current weight</Tracker.IconTitle
      >
      <Tracker.Actions>
        <!-- minus icon -->
        <Tracker.Action.Item
          icon="M19,13H5V11H19V13Z"
          onclick={() => weight--}
        />
        <!-- plus icon -->
        <Tracker.Action.Item
          icon="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
          onclick={() => weight++}
        />
      </Tracker.Actions>
    </Tracker.Root>
  {/snippet}
</Story>
