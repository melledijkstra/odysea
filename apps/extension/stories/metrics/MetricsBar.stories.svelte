<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Metrics from '@/components/topbar/MetricsBar.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Metrics (localstorage)',
    component: Metrics,
    argTypes: {},
  })

  const metricMock = [
    {
      name: 'Counter',
      value: 42,
      pinned: true,
    },
    {
      name: 'World Clock (New York)',
      timeZone: 'America/New_York',
      pinned: true,
    },
    {
      name: 'Countdown (1 day)',
      date: Date.now() + 1000 * 60 * 60 * 24, // 1 day from now
      pinned: true,
    },
    {
      name: 'Counter (not pinned)',
      value: 100,
      pinned: false,
    },
    {
      name: 'World Clock (Tokyo)',
      timeZone: 'Asia/Tokyo',
      pinned: false,
    },
    {
      name: 'Countdown (2 days)',
      date: Date.now() + 1000 * 60 * 60 * 48, // 2 days from now
      pinned: false,
    },
  ]
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" args={{
  metrics: metricMock,
}} />

<Story name="Empty" args={{ metrics: [] }} />
