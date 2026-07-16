<script lang="ts">
  import { loadModule, type Module, type ModuleID } from '@/modules'
  import { settingsStore } from '@/settings/index.svelte'

  const modules = $state<Module[]>([])

  $effect(() => {
    let active = true

    const loadEnabledModules = async () => {
      const modulePromises = Object.entries(settingsStore.modules)
        .filter(([, enabled]) => enabled)
        .map(([name]) => loadModule(name as ModuleID))

      const loadedModulesResults = await Promise.allSettled(modulePromises)

      if (!active) return

      // Update modules array atomically to trigger Svelte reactivity correctly if needed
      modules.length = 0
      for (const result of loadedModulesResults) {
        if (result.status === 'fulfilled' && result.value) {
          modules.push(result.value)
        }
      }
    }

    loadEnabledModules()

    return () => {
      active = false
    }
  })
</script>
