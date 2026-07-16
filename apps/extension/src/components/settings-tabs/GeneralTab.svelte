<script>
  import Toggle from '@/components/atoms/Toggle.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'

  const googleTasksEnabled = $derived(settingsStore.modules.google_tasks)
</script>

<h1 class="text-xl">General Settings</h1>
<Toggle
  label="Show currently focussed task (requires Google Tasks module)"
  disabled={!googleTasksEnabled}
  parentClass="my-2"
  onchange={settings.saveSettingsToStorage}
  bind:checked={settingsStore.ui.showCurrentTask}
/>
