<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Sleep from '@/components/atoms/metrics/Sleep.svelte'

  const { Story } = defineMeta({
    title: 'Metrics (localstorage)/Sleep',
    component: Sleep,
    argTypes: {
      minutes: {
        type: 'number',
        control: 'number',
        description:
          'The number of minutes slept, used to calculate hours and minutes.',
      },
    },
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Default"
  args={{
    minutes: 483, // 8 hours and 3 minutes
  }}
/>

<Story
  name="Hours Only"
  args={{
    minutes: 300, // 5 hours
  }}
/>

<Story
  name="Minutes Only"
  args={{
    minutes: 30,
  }}
/>

<Story name="No data" />
