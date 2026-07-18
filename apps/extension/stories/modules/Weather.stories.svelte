<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import WeatherInfo from '@/modules/weather/WeatherInfo.svelte'

  const { Story } = defineMeta({
    title: 'Modules/Weather',
    component: WeatherInfo,
    args: {
      iconId: '01d',
      temperatureKelvin: 300,
      displayUnit: 'C',
      location: 'Madrid',
    },
  })
</script>

<Story name="Default" />

<Story
  name="Fahrenheit"
  args={{
    temperatureKelvin: 288.15,
    displayUnit: 'F',
  }}
/>

<Story
  name="Long city name"
  args={{
    iconId: '01d',
    location: 'Winchester-on-the-Severn, Maryland',
    temperatureKelvin: 299.15,
    displayUnit: 'F',
  }}
/>
