<script lang="ts">
  import Button from '@/components/atoms/Button.svelte'
  import type { FocusSession } from '@/db/focus'
  import { getAllFocusSessions } from '@/db/focus'
  import type { Habit } from '@/db/habits'
  import { getAllHabits } from '@/db/habits'
  import type { Note } from '@/db/notes'
  import { getAllNotes } from '@/db/notes'
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
    const notes = await getAllNotes()
    const habits = await getAllHabits()
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
