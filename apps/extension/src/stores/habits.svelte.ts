import { habitsRepository, type Habit } from '@/db/habits'
import { DbStore } from './databaseStore.svelte'

export const habits = new DbStore<Habit>(habitsRepository)
