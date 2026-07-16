import type { Module } from '@/modules'
import Breathing from './Breathing.svelte'
import BreathingMenuItem from './BreathingMenuItem.svelte'

export default {
  component: Breathing,
  scene: Breathing,
  trigger: BreathingMenuItem,
} satisfies Module
