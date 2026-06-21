<script lang="ts">
  import Button from '@melledijkstra/ui/svelte/Button.svelte'
  import type { FocusSession } from '@/db/focus'
  import { getAllFocusSessions } from '@/db/focus'
  import type { Habit } from '@/db/habits'
  import { habitsRepository } from '@/db/habits'
  import type { Note } from '@/db/notes'
  import { notesRepository } from '@/db/notes'
  import { settings, type SettingsState } from '@/settings/index.svelte'
  import { updateInDB, clearDB } from '@/db'
  import { settingsStore } from '@/settings/index.svelte'

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

  let fileInput: HTMLInputElement | undefined

  async function importData(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files || target.files.length === 0) return

    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const data: Export = JSON.parse(text)

        // Restore Settings
        if (data.settings) {
          Object.assign(settingsStore, data.settings)
          await settings.saveSettingsToStorage()
        }

        // Restore Databases
        if (data.databases) {
          if (data.databases.focusSessions) {
            await clearDB('focus')
            for (const session of data.databases.focusSessions) {
              await updateInDB('focus', session)
            }
          }

          if (data.databases.notes) {
            await clearDB('notes')
            for (const note of data.databases.notes) {
              await updateInDB('notes', note)
            }
          }

          if (data.databases.habits) {
            await clearDB('habits')
            for (const habit of data.databases.habits) {
              await updateInDB('habits', habit)
            }
          }
        }

        alert('Data imported successfully!')
      } catch (err) {
        console.error('Error importing data:', err)
        alert('Failed to import data.')
      }
    }

    reader.readAsText(file)
  }
</script>

<h1 class="text-xl">Data Management</h1>
<p class="text-sm">Export or import your settings and data</p>
<div class="flex gap-2">
  <Button class="mt-2" onclick={exportData}>Export</Button>
  <Button class="mt-2" onclick={() => fileInput?.click()}>Import</Button>
  <input
    type="file"
    accept=".json"
    style="display: none;"
    bind:this={fileInput}
    onchange={importData}
  />
</div>
