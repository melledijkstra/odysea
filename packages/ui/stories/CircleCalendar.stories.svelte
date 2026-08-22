<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import CircleCalendar from '@/svelte/CircleCalendar.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/Calendar/CircleCalendar',
    component: CircleCalendar,
  })
</script>

<Story name="Default">
  <CircleCalendar />
</Story>
