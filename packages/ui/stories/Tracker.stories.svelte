<script module lang="ts">
  import type { Snippet } from 'svelte'
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { Tracker } from '@/svelte/tracker'
  import type { ClassValue } from 'svelte/elements'

  type TrackerProps = {
    class?: ClassValue
    children?: Snippet
    metric?: string | number
    title?: string
  }

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
  name="With string metric"
  args={{ metric: 'January 1st', title: 'New Year!' }}
  {template}
/>
