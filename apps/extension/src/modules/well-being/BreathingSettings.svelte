<script lang="ts">
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'

  type NumericBreathingKey =
    | 'durationMinutes'
    | 'inhaleSeconds'
    | 'holdSeconds'
    | 'exhaleSeconds'
    | 'holdOutSeconds'

  function onNumberChange(key: NumericBreathingKey, min = 1) {
    const val = Number(settingsStore.breathing[key])
    if (isNaN(val) || val < min) {
      settingsStore.breathing[key] = min
    } else {
      settingsStore.breathing[key] = Math.round(val)
    }
    settings.saveSettingsToStorage()
  }
</script>

<div class="space-y-4 max-w-md">
  <h2 class="text-base font-semibold text-zinc-800 dark:text-zinc-200">
    Breathing Exercise Configuration
  </h2>

  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div>
      <Input
        label="Duration (minutes)"
        name="duration-minutes"
        type="number"
        min="1"
        max="60"
        bind:value={settingsStore.breathing.durationMinutes}
        onchange={() => onNumberChange('durationMinutes', 1)}
      />
      <span class="text-xs text-zinc-400">Total duration (default: 5m)</span>
    </div>

    <div>
      <Input
        label="Inhale time (seconds)"
        name="inhale-seconds"
        type="number"
        min="1"
        max="60"
        bind:value={settingsStore.breathing.inhaleSeconds}
        onchange={() => onNumberChange('inhaleSeconds', 1)}
      />
      <span class="text-xs text-zinc-400">Time to breathe in (default: 5s)</span
      >
    </div>

    <div>
      <Input
        label="Hold after inhale (seconds)"
        name="hold-seconds"
        type="number"
        min="0"
        max="60"
        bind:value={settingsStore.breathing.holdSeconds}
        onchange={() => onNumberChange('holdSeconds', 0)}
      />
      <span class="text-xs text-zinc-400"
        >0 to skip retention (default: 0s)</span
      >
    </div>

    <div>
      <Input
        label="Exhale time (seconds)"
        name="exhale-seconds"
        type="number"
        min="1"
        max="60"
        bind:value={settingsStore.breathing.exhaleSeconds}
        onchange={() => onNumberChange('exhaleSeconds', 1)}
      />
      <span class="text-xs text-zinc-400"
        >Time to breathe out (default: 7s)</span
      >
    </div>

    <div class="sm:col-span-2">
      <Input
        label="Hold after exhale (seconds)"
        name="hold-out-seconds"
        type="number"
        min="0"
        max="60"
        bind:value={settingsStore.breathing.holdOutSeconds}
        onchange={() => onNumberChange('holdOutSeconds', 0)}
      />
      <span class="text-xs text-zinc-400">
        Optional for box breathing (default: 0s)
      </span>
    </div>

    <div class="sm:col-span-2 pt-2">
      <Toggle
        label="Enable sounds"
        name="breathing-sound"
        bind:checked={settingsStore.breathing.soundOn}
        onchange={settings.saveSettingsToStorage}
      />
      <span class="text-xs text-zinc-400 block mt-1">
        Play gentle chimes on phase changes and completion bell
      </span>
    </div>
  </div>
</div>
