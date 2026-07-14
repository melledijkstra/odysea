import type { Module } from '@/modules'
import HabitsTrigger from './HabitsTrigger.svelte'
import HabitsScene from './HabitsScene.svelte'
import { habits } from '@/stores/habits.svelte'

const habitsModule: Module = {
  component: HabitsTrigger,
  scene: HabitsScene,
  trigger: HabitsTrigger,
  init: () => {
    habits.initialize()
  },
}

export default habitsModule
