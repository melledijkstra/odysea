<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Toggle from '@/svelte/Toggle.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/Toggle',
    component: Toggle,
  })
</script>

<Story name="Default" />

<Story name="Checked" args={{ checked: true, label: 'Toggle dark mode' }} />

<Story name="Not Checked" args={{ label: 'Toggle dark mode' }} />
