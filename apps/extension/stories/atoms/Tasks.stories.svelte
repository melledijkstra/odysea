<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import TaskList from '@/components/atoms/tasks/TaskList.svelte'

  const { Story } = defineMeta({
    title: 'Atoms/TaskList',
    component: TaskList,
    args: {
      tasks: [],
    },
  })
</script>

<Story name="No tasks" args={{
  tasks: [],
}} />

<Story name="With tasks" args={{
  tasks: [
    {
      id: '1',
      title: 'Task 1',
      status: 'needsAction',
    },
    {
      id: '2',
      title: 'Task 2',
      status: 'needsAction',
    },
    {
      id: '3',
      title: 'Task 3',
      status: 'completed',
    },
  ],
}} />

<Story name="With long tasks" args={{
  tasks: [
    {
      id: '1',
      title: 'Task 1 with a long title that should wrap lore ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
      status: 'needsAction',
    },
    {
      id: '2',
      title: 'Normal Task Title',
      status: 'needsAction',
    },
    {
      id: '3',
      title: 'Task 3 with a long title that should wrap lore ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
      status: 'completed',
    },
  ],
}} />

<Story name="Many tasks" args={{
  tasks: Array.from({ length: 100 }, (_, i) => ({
    id: i.toString(),
    title: `Task ${i + 1}`,
    status: i % 4 === 0 ? 'needsAction' : 'completed',
  })),
}} />
