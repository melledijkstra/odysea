<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import DropdownMenu from '@/components/atoms/DropdownMenu.svelte'
  import Icon from '@/components/atoms/Icon.svelte'
  import { mdiDotsHorizontal } from '@mdi/js'

  // set this to true to keep the menu open during development
  const keepOpen = false

  const onSelect = (label: string) => {
    console.log('onSelect', label)
  }

  const { Story } = defineMeta({
    title: 'Atoms/DropdownMenu',
    component: DropdownMenu,
    args: {
      contentProps: {
        sideOffset: 5,
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

{#snippet trigger()}
  <div class="p-2 bg-black border border-gray-400 rounded-full cursor-pointer">
    <Icon path={mdiDotsHorizontal} class="text-white" size={25} />
  </div>
{/snippet}

<Story name="Default">
  {@render trigger()}
</Story>

<Story name="With Heading" args={{ heading: 'Open...' }}>
  {@render trigger()}
</Story>
