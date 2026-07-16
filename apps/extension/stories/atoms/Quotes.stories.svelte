<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Quotes from '@/components/atoms/Quotes.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/Quotes',
    component: Quotes,
  })
</script>

<Story name="Default" />
