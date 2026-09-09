import type { Module } from '@/modules'
import Breathing from './Breathing.svelte'
import BreathingMenuItem from './BreathingMenuItem.svelte'
import BreathingSettings from './BreathingSettings.svelte'

export default {
  component: Breathing,
  scene: Breathing,
  trigger: BreathingMenuItem,
  settings: BreathingSettings,
} satisfies Module
