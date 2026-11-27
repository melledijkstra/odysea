<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { Popover } from 'bits-ui'
  import WeatherPanel from '@/modules/weather/WeatherPanel.svelte'
  import {
    SAMPLE_DAILY_WEATHER,
    SAMPLE_HOURLY_WEATHER,
    SAMPLE_RAINY_WEATHER_DETAILS,
    SAMPLE_WEATHER_DETAILS,
  } from '@/fixtures/weather'

  const { Story } = defineMeta({
    title: 'Modules/WeatherPanel',
    component: WeatherPanel,
    args: {
      location: 'Amsterdam',
      current: SAMPLE_WEATHER_DETAILS,
      hourly: SAMPLE_HOURLY_WEATHER,
      daily: SAMPLE_DAILY_WEATHER,
      updatedLabel: 'Updated 3m ago',
      defaultTab: 'today',
    },
  })
</script>

{#snippet template(args: Parameters<typeof WeatherPanel>[1])}
  <div class="flex justify-end p-8">
    <Popover.Root open={true}>
      <Popover.Trigger class="text-xs px-2 py-1 rounded bg-white/10">
        18°C Amsterdam
      </Popover.Trigger>
      <WeatherPanel {...args} />
    </Popover.Root>
  </div>
{/snippet}

<Story name="Today" {template} />

<Story
  name="Forecast"
  args={{
    defaultTab: 'forecast',
  }}
  {template}
/>

<Story
  name="Loading Forecasts"
  args={{
    hourly: [],
    daily: [],
    isHourlyLoading: true,
    isDailyLoading: true,
  }}
  {template}
/>

<Story
  name="Rainy Conditions"
  args={{
    location: 'London',
    current: SAMPLE_RAINY_WEATHER_DETAILS,
  }}
  {template}
/>
