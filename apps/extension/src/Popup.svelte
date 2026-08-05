<script lang="ts">
  import { onMount } from 'svelte'
  import { appState } from './app-state.svelte'
  import { getPomodoroState } from './modules/focus/messages'
  import type { PomodoroState } from './modules/focus/types'
  import { Timer } from '@melledijkstra/toolbox'
  import Spinner from '@/components/atoms/Spinner.svelte'

  let pomodoroState = $state<PomodoroState>()

  onMount(async () => {
    const state = await getPomodoroState.send()
    pomodoroState = state
  })
</script>

<div class="w-96 p-2 space-y-2 bg-zinc-900 text-white">
  <h1 class="text-2xl font-bold">Popup Extension</h1>
  <p>City: {appState.geolocation?.city}</p>
  <p>App mode: {appState.mode}</p>
  <h2 class="text-1xl font-bold">Pomodoro</h2>
  {#if !pomodoroState}
    <div class="flex p-4">
      <Spinner class="text-gray-400" />
    </div>
  {:else}
    <p>Running?: {pomodoroState.isRunning}</p>
    <p>mode: {pomodoroState.mode}</p>
    <p>{Timer.formatRemainingTime(pomodoroState.timeRemaining)}</p>
  {/if}
</div>
