<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import MenuButton from '@/components/atoms/MenuButton.svelte'
  import { mdiAirplane, mdiSpa } from '@mdi/js'

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Atoms/MenuButton',
    component: MenuButton,
    parameters: {
      backgrounds: {
        values: [
          {
            name: 'light',
            value: '#f9f9f9',
          },
          {
            name: 'dark',
            value: '#333333',
          },
        ],
        default: 'light',
      },
    },
    args: {
      mdiIcon: mdiSpa,
    },
  })
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Default" args={{
  tooltip: 'This is an airplane!',
  mdiIcon: mdiAirplane,
}} />

<Story name="Without Tooltip" />

<Story name="Multiple" args={{
  tooltip: 'This is a button',
}}>
  {#snippet template(args)}
    <div class="flex gap-10">
      <MenuButton {...args} />
      <MenuButton {...args} />
      <MenuButton {...args} />
      <MenuButton {...args} />
    </div>
  {/snippet}
</Story>
