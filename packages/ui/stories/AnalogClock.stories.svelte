<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import AnalogClock from '@/svelte/AnalogClock.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/AnalogClock',
    component: AnalogClock,
  })
</script>

<Story name="Default" />
