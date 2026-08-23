<script lang="ts">
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import { habits } from '@/stores/habits.svelte'
  import { mdiProgressCheck } from '@mdi/js'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import { Popover } from 'bits-ui'
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import Button from '@melledijkstra/ui/svelte/Button.svelte'

  let newHabit = $state('')

  async function handleAddHabit() {
    if (newHabit.trim()) {
      await habits.add({
        name: newHabit,
        color: '#eee',
        goal: 0,
        step: 1,
        unit: 'count',
      })
      newHabit = ''
    }
  }
</script>

<Popover.Root>
  <Popover.Trigger>
    <IconButton
      icon={mdiProgressCheck}
      aria-label="Open habit tracker"
      title="Open habit tracker"
    />
  </Popover.Trigger>
  <PopPanel>
    <h1 class="text-xl font-bold">Habit Tracker</h1>
    <div class="mt-4">
      <Input type="text" bind:value={newHabit} placeholder="Enter new habit" />
      <Button onclick={handleAddHabit} class="mt-2">Add Habit</Button>
    </div>
    <ul class="mt-4">
      {#each habits.items as habit, i (i)}
        <li style:color={habit.color} class="p-2 border-b">{habit.name}</li>
      {/each}
    </ul>
  </PopPanel>
</Popover.Root>
