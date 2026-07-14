import { Logger } from '@/logger.ts'
import type { Component } from 'svelte'

const logger = new Logger('modules')

/**
 * MODULE INTERFACE
 */
export interface Module {
  component: Component
  scene?: Component
  trigger?: Component
  init?: () => void
}

type ModuleConfigItem = {
  id: string
  title: string
  import: () => Promise<{ default: Module }>
}

export const MODULE_CONFIG = [
  {
    id: 'google_tasks',
    title: 'Google Tasks',
    import: () => import('./google-tasks/index.ts'),
  },
  {
    id: 'notes',
    title: 'Quick Notes',
    import: () => import('./notes/index.ts'),
  },
  {
    id: 'well_being',
    title: 'Well Being',
    import: () => import('./well-being/index.ts'),
  },
  {
    id: 'spotify',
    title: 'Spotify',
    import: () => import('./spotify/index.ts'),
  },
  {
    id: 'focus',
    title: 'Focus Sessions',
    import: () => import('./focus/index.ts'),
  },
  {
    id: 'weather',
    title: 'Weather',
    import: () => import('./weather/index.ts'),
  },
  {
    id: 'habits',
    title: 'Habits',
    import: () => import('./habits/index.ts'),
  },
] as const satisfies ReadonlyArray<ModuleConfigItem>

export type ModuleID = (typeof MODULE_CONFIG)[number]['id']

function isValidModule(module: unknown): module is Module {
  return typeof module === 'object' && module !== null && 'component' in module
}

const loadedModules = new Map<ModuleID, Module>()

export async function loadModule(id: ModuleID): Promise<Module> {
  const module = MODULE_CONFIG.find(m => m.id === id)

  if (!module) {
    throw new Error(`Module ${id} not found`)
  }

  if (loadedModules.has(id)) {
    logger.log(`Module "${id}" already loaded, returning from cache`)
    return loadedModules.get(id) as Module // cast to Module as we know it exists
  }

  const loadedModule = await module.import()
  logger.log(`Loaded module: ${id}`)

  if (!isValidModule(loadedModule.default)) {
    throw new Error(
      `Loaded module "${id}" does not conform to the Module interface`,
    )
  }

  if (loadedModule.default.init) {
    // allow the module to bootstrap itself
    loadedModule.default.init()
  }

  loadedModules.set(id, loadedModule.default)

  return loadedModule.default
}
