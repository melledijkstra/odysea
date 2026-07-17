import { storeInDB, getAllItems, updateInDB, deleteInDB } from '@/db'
import {
  type IRepositoryAdapter,
  type Insertable,
} from '@melledijkstra/storage'

const DB_NAME = 'habits' as const

export type Habit = {
  id: number
  name: string
  color: string
  goal: number
  step: number
  unit: string
  createdAt: Date
  updatedAt: Date
}

class HabitsRepository implements IRepositoryAdapter<Habit> {
  async getAll(): Promise<Habit[]> {
    return await getAllItems(DB_NAME)
  }

  async add(habit: Insertable<Habit>): Promise<Habit> {
    const habitWithMeta = {
      ...habit,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Habit
    const id = await storeInDB(DB_NAME, habitWithMeta)
    habitWithMeta.id = id
    return habitWithMeta
  }

  async update(habit: Habit): Promise<void> {
    await updateInDB(DB_NAME, habit)
  }

  async delete(id: number): Promise<void> {
    await deleteInDB(DB_NAME, id)
  }
}

export const habitsRepository = new HabitsRepository()
