<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Button from '@/components/atoms/Button.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Atoms/Buttons/Normal',
    component: Button,
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default">Simple Button</Story>
