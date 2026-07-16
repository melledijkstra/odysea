<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Form from '@/modules/trackers/world-clocks/Form.svelte'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Metrics (localstorage)/World Clock Form',
    component: Form,
    argTypes: {},
    args: {},
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default">
  {#snippet template()}
    <Form />
  {/snippet}
</Story>
