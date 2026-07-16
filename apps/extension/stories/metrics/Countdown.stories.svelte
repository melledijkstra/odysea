<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Countdown from '@/components/atoms/metrics/Countdown.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Metrics (localstorage)/Countdown',
    component: Countdown,
    argTypes: {
      metric: {
        type: 'symbol',
        control: 'object',
        description: 'A countdown metric with a name, pinned status, and date.',
      },
    },
    args: {
      metric: {
        name: '5 days until vacation',
        pinned: true,
        date: Date.now() + 1000 * 60 * 60 * 24 * 5, // 5 days from now
      },
    },
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" />
