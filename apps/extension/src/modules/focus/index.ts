import type { Module } from '@/modules'
import Focus from './Focus.svelte'
import FocusMenuItem from './FocusMenuItem.svelte'

export default {
  component: Focus,
  scene: Focus,
  trigger: FocusMenuItem,
} satisfies Module
