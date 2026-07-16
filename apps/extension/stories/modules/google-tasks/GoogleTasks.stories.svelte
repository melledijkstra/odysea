<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import TasksPanelContent from '@/modules/google-tasks/TasksPanelContent.svelte'
  import { MockTasksController } from '@/mocks/MockTasksController'
  import Panel from '@/components/atoms/Panel.svelte'
  import type { ComponentProps } from 'svelte'
  import { mockTaskLists, mockTasks } from '@/fixtures/tasks'

  type Args = ComponentProps<typeof TasksPanelContent>

  const state = $state({
    tasks: mockTasks,
    taskLists: mockTaskLists,
  })

  const controller = new MockTasksController(state)

  const { Story } = defineMeta({
    title: 'Modules/GoogleTasks',
    component: TasksPanelContent,
    args: {
      controller,
      state,
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
