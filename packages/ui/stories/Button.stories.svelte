<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Button from '@/svelte/Button.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/Buttons/Normal',
    component: Button,
  })
</script>

<Story name="Default">Simple Button</Story>
