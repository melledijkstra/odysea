<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import ScrollArea from '@/components/atoms/ScrollArea.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/ScrollArea',
    component: ScrollArea,
  })
</script>

<Story name="Default" args={{ orientation: 'vertical' }}>
  {#snippet template(props)}
    <ScrollArea
      {...props}
      class="w-64 h-64 bg-white dark:bg-black text-black dark:text-white p-2"
    >
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero ex veniam
      dolorum esse id voluptatum, quod placeat quae odit quaerat quis, magni
      rerum dolorem aperiam nihil cum reiciendis sunt? Corporis. Lorem ipsum
      dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.
      Doloribus, cumque. Quasi, voluptates. Doloremque, cumque. Quasi,
      voluptates. Doloremque, cumque. Lorem ipsum dolor sit amet consectetur
      adipisicing elit. Quisquam, voluptatum. Doloribus, cumque. Quasi,
      voluptates. Doloremque, cumque. Quasi
    </ScrollArea>
  {/snippet}
</Story>
