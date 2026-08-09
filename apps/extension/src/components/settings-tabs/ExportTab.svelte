<script lang="ts">
  import Button from '@melledijkstra/ui/svelte/Button.svelte'
  import type { FocusSession } from '@/db/focus'
  import { getAllFocusSessions } from '@/db/focus'
  import { habitsRepository, type Habit } from '@/db/habits'
  import { notesRepository, type Note } from '@/db/notes'
  import { settings, type SettingsState } from '@/settings/index.svelte'

  type Export = {
    databases?: {
      focusSessions?: FocusSession[]
      habits?: Habit[]
      notes?: Note[]
    }
    settings: SettingsState
  }

  async function exportData() {
    const focusSessions = await getAllFocusSessions()
    const notes = await notesRepository.getAll()
    const habits = await habitsRepository.getAll()
    const exportData: Export = {
      databases: {
        focusSessions,
        habits,
        notes,
      },
      settings: settings.export(),
    }
    const data = JSON.stringify(exportData)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.json'
    a.click()
  }
</script>

<h1 class="text-xl">Export Settings</h1>
<p class="text-sm">Export your settings to a file</p>
<Button class="mt-2" onclick={exportData}>Export</Button>
