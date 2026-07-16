<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import WeatherInfo from '@/modules/weather/WeatherInfo.svelte'

  const { Story } = defineMeta({
    title: 'Modules/Weather',
    component: WeatherInfo,
    args: {
      iconId: '01d',
      temperatureF: 300,
      displayUnit: 'C',
      location: 'Madrid',
    },
  })
</script>

<Story name="Default" />

<Story name="Fahrenheit" args={{
  temperatureF: 59,
  displayUnit: 'F',
}} />

<Story name="Long city name" args={{
  iconId: '01d',
  location: 'Winchester-on-the-Severn, Maryland',
  temperatureF: 79,
  displayUnit: 'F',
}} />
