<script lang="ts">
  import { habits } from '@/stores/habits.svelte'
  import Input from '@/components/atoms/Input.svelte'
  import Button from '@/components/atoms/Button.svelte'
  import type { Habit } from '@/db/habits'
  import type { Insertable } from '@melledijkstra/storage'

  const newHabit = $state<Insertable<Habit> & { id?: string }>({
    name: '',
    color: '#000000',
    goal: 0,
    step: 1,
    unit: 'count',
  })
</script>

<h1 class="text-2xl">Habit Tracker Module</h1>

<h2 class="text-lg">Habits</h2>
<table class="min-w-full divide-y divide-gray-200 mt-4">
  <thead class="bg-gray-500">
    <tr>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">ID</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Color</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Name</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Goal</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Step</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Unit</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Created At</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Updated At</th>
      <th class="px-4 py-2 text-left text-xs font-medium text-white uppercase">Actions</th>
    </tr>
  </thead>
  <tbody class="bg-gray-600 divide-y divide-gray-200">
    {#each habits.items as habit (habit.id)}
      <tr>
        <td class="px-4 py-2 text-sm text-gray-300">{habit.id}</td>
        <td class="px-4 py-2">
          <div class="w-4 h-4 rounded-full border" style="background-color: {habit.color}"></div>
        </td>
        <td class="px-4 py-2 text-lg">{habit.name}</td>
        <td class="px-4 py-2 text-sm">{habit.goal}</td>
        <td class="px-4 py-2 text-sm">{habit.step}</td>
        <td class="px-4 py-2 text-sm">{habit.unit}</td>
        <td class="px-4 py-2 text-sm">{habit.createdAt.toLocaleDateString()}</td>
        <td class="px-4 py-2 text-sm">{habit.updatedAt.toLocaleDateString()}</td>
        <td class="px-4 py-2">
          <div class="flex items-center gap-2">
            <Button class="bg-blue-500 hover:bg-blue-600" onclick={() => {
              Object.assign(newHabit, habit)
            }}>Edit</Button>
            <Button class="bg-red-500 hover:bg-red-600" onclick={() => habits.remove(habit.id)}>Delete</Button>
          </div>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<h2 class="text-lg">Habit Entries</h2>

<form onsubmit={(event) => {
  event.preventDefault()
  if (newHabit?.id) {
    habits.update(newHabit as Habit)
  }
  else {
    habits.add(newHabit)
  }
}}>
  {#if newHabit.id}
    <Input type="hidden" bind:value={newHabit.id} />
  {/if}
  <Input label="Name" required type="text" bind:value={newHabit.name} />
  <Input label="Color" required type="color" bind:value={newHabit.color} />
  <Input label="Goal" required type="number" bind:value={newHabit.goal} />
  <Input label="Step" step="0.01" required type="number" bind:value={newHabit.step} />
  <Input label="Unit" required type="text" bind:value={newHabit.unit} />
  <Button type="submit">{newHabit.id ? 'Update' : 'Add'} Habit</Button>
</form>
