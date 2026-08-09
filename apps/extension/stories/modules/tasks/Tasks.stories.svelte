<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import TasksPanelContent from '@/modules/tasks/TasksPanelContent.svelte'
  import { MockTasksController } from '@/mocks/MockTasksController'
  import Panel from '@melledijkstra/ui/svelte/Panel.svelte'
  import type { ComponentProps } from 'svelte'
  import { mockTaskLists, mockTasks } from '@/fixtures/tasks'

  type Args = ComponentProps<typeof TasksPanelContent>

  const state = $state({
    tasks: mockTasks,
    taskLists: mockTaskLists,
  })

  const controller = new MockTasksController(state)

  const { Story } = defineMeta({
    title: 'Modules/Tasks',
    component: TasksPanelContent,
    args: {
      controller,
      providerId: 'google',
    },
  })
</script>

<Story name="Default">
  {#snippet template(args: Args)}
    <Panel size="small">
      <TasksPanelContent {...args} />
    </Panel>
  {/snippet}
</Story>
