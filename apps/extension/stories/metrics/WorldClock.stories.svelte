<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import WorldClockComponent from '@/components/trackers/WorldClockTracker.svelte'
  import { WorldClock } from '@/modules/trackers/worldclock/worldclock.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Metrics (localstorage)/World Clock',
    component: WorldClockComponent,
    argTypes: {
      metric: {
        type: 'symbol',
        control: 'object',
      },
    },
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
  name="Amsterdam"
  args={{
    metric: new WorldClock('1', 'Amsterdam', 'Europe/Amsterdam', true),
  }}
/>

<Story
  name="Tokyo"
  args={{
    metric: new WorldClock('2', 'Tokyo', 'Asia/Tokyo', true),
  }}
/>
