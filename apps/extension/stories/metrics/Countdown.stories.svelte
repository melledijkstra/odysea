<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CountdownComponent from '@/components/trackers/Countdown.svelte'
  import { Countdown } from '@/modules/trackers/countdown/countdown.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Metrics (localstorage)/Countdown',
    component: CountdownComponent,
    argTypes: {
      metric: {
        type: 'symbol',
        control: 'object',
        description: 'A countdown metric with a name, pinned status, and date.',
      },
    },
    args: {
      metric: new Countdown(
        '1',
        '5 days until vacation',
        Date.now() + 1000 * 60 * 60 * 24 * 5, // 5 days from now
        true
      ),
    },
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" />
