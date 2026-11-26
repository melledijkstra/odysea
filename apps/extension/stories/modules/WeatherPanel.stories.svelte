<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import { Popover } from 'bits-ui'
  import WeatherPanel from '@/modules/weather/WeatherPanel.svelte'
  import type {
    WeatherPanelCurrent,
    WeatherPanelDailyItem,
    WeatherPanelHourlyItem,
  } from '@/modules/weather/types'

  const SAMPLE_CURRENT: WeatherPanelCurrent = {
    iconId: '02d',
    temperatureC: 18,
    feelsLikeC: 17,
    description: 'partly cloudy',
    highC: 21,
    lowC: 11,
    windKmh: 20,
    windGustKmh: 30,
    windCompass: 'SW',
    windDeg: 225,
    humidity: 62,
    uvi: 4.2,
    uviLevel: 'Moderate',
    sunriseTime: '06:15',
    sunsetTime: '20:58',
    visibilityKm: 10,
    pressureHpa: 1018,
  }

  const SAMPLE_HOURLY: WeatherPanelHourlyItem[] = [
    { id: 1, label: 'Now', iconId: '02d', temperatureC: 18, precipChance: 0 },
    {
      id: 2,
      label: '14:00',
      iconId: '02d',
      temperatureC: 19,
      precipChance: 10,
    },
    {
      id: 3,
      label: '15:00',
      iconId: '03d',
      temperatureC: 20,
      precipChance: 20,
    },
    {
      id: 4,
      label: '16:00',
      iconId: '10d',
      temperatureC: 19,
      precipChance: 65,
    },
    {
      id: 5,
      label: '17:00',
      iconId: '09d',
      temperatureC: 17,
      precipChance: 80,
    },
    {
      id: 6,
      label: '18:00',
      iconId: '10d',
      temperatureC: 16,
      precipChance: 40,
    },
    {
      id: 7,
      label: '19:00',
      iconId: '02d',
      temperatureC: 15,
      precipChance: 15,
    },
    { id: 8, label: '20:00', iconId: '01d', temperatureC: 14, precipChance: 0 },
    { id: 9, label: '21:00', iconId: '01n', temperatureC: 13, precipChance: 0 },
  ]

  const SAMPLE_DAILY: WeatherPanelDailyItem[] = [
    {
      id: 1,
      label: 'Today',
      iconId: '02d',
      description: 'partly cloudy',
      lowC: 11,
      highC: 21,
      precipChance: 20,
    },
    {
      id: 2,
      label: 'Thu',
      iconId: '10d',
      description: 'light rain',
      lowC: 10,
      highC: 17,
      precipChance: 75,
    },
    {
      id: 3,
      label: 'Fri',
      iconId: '09d',
      description: 'moderate rain',
      lowC: 9,
      highC: 15,
      precipChance: 90,
    },
    {
      id: 4,
      label: 'Sat',
      iconId: '02d',
      description: 'few clouds',
      lowC: 10,
      highC: 18,
      precipChance: 15,
    },
    {
      id: 5,
      label: 'Sun',
      iconId: '01d',
      description: 'clear sky',
      lowC: 12,
      highC: 23,
      precipChance: 0,
    },
    {
      id: 6,
      label: 'Mon',
      iconId: '01d',
      description: 'clear sky',
      lowC: 13,
      highC: 24,
      precipChance: 0,
    },
    {
      id: 7,
      label: 'Tue',
      iconId: '03d',
      description: 'scattered clouds',
      lowC: 12,
      highC: 20,
      precipChance: 10,
    },
    {
      id: 8,
      label: 'Wed',
      iconId: '10d',
      description: 'light rain',
      lowC: 11,
      highC: 18,
      precipChance: 55,
    },
    {
      id: 9,
      label: 'Thu',
      iconId: '02d',
      description: 'partly cloudy',
      lowC: 10,
      highC: 19,
      precipChance: 20,
    },
    {
      id: 10,
      label: 'Fri',
      iconId: '01d',
      description: 'clear sky',
      lowC: 12,
      highC: 22,
      precipChance: 0,
    },
  ]

  const { Story } = defineMeta({
    title: 'Modules/WeatherPanel',
    component: WeatherPanel,
    args: {
      location: 'Amsterdam',
      current: SAMPLE_CURRENT,
      hourly: SAMPLE_HOURLY,
      daily: SAMPLE_DAILY,
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
    current: {
      ...SAMPLE_CURRENT,
      iconId: '09d',
      temperatureC: 12,
      feelsLikeC: 10,
      description: 'heavy intensity rain',
      highC: 14,
      lowC: 8,
      windKmh: 34,
      windGustKmh: 52,
      windCompass: 'W',
      windDeg: 270,
      humidity: 91,
      uvi: 1.1,
      uviLevel: 'Low',
      visibilityKm: 4.5,
      pressureHpa: 998,
    },
  }}
  {template}
/>
