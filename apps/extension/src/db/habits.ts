import { storeInDB, getAllItems, updateInDB, deleteInDB } from '@/db'

export type Habit = {
  name: string
  color: string
  goal: number
  step: number
  unit: string
}

export async function addHabit(habit: Habit) {
  await storeInDB('habits', habit)
}

export async function getAllHabits(): Promise<Habit[]> {
  return await getAllItems('habits')
}

export async function updateHabit(habit: Habit) {
  await updateInDB('habits', habit)
}

export async function deleteHabit(id: string) {
  await deleteInDB('habits', id)
}
