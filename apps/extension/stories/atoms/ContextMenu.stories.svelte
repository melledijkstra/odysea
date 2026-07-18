<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import ContextMenu from '@/components/atoms/ContextMenu.svelte'

  // set this to true to keep the menu open during development
  const keepOpen = true

  const onSelect = (label: string) => {
    console.log('onSelect', label)
  }

  const { Story } = defineMeta({
    title: 'Atoms/ContextMenu',
    component: ContextMenu,
    args: {
      contentProps: {
        forceMount: keepOpen,
      },
      items: [
        {
          label: 'Open File',
          onSelect,
        },
        {
          label: 'Open Folder',
          onSelect,
        },
        {
          label: 'Open Project',
          onSelect,
        },
      ],
    },
  })
</script>

{#snippet contextArea()}
  <div
    class="size-96 flex items-center justify-center text-sm text-white border-dashed border-2 border-white"
  >
    Right click to open the context menu
  </div>
{/snippet}

<Story name="Default">
  {@render contextArea()}
</Story>

<Story name="With Heading" args={{ heading: 'Open...' }}>
  {@render contextArea()}
</Story>
