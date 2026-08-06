<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Metrics from '@/components/topbar/MetricsBar.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Metrics (localstorage)',
    component: Metrics,
    argTypes: {},
  })

  // We actually don't accept 'metrics' array via props in MetricsBar anymore
</script>

<Story name="Default" />
