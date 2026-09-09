<script lang="ts">
  import { onDestroy } from 'svelte'
  import { fade } from 'svelte/transition'
  import { breathingState } from './breathing.state.svelte'

  onDestroy(() => {
    breathingState.destroy()
  })

  let phaseDuration = $derived(
    breathingState.active ? breathingState.currentPhaseDuration : 1
  )
</script>

<div class="flex flex-col gap justify-center items-center">
  <button
    onclick={() => breathingState.toggle()}
    style="--phase-duration: {phaseDuration}s;"
    class={[
      'breathing-circle overflow-hidden border-2 border-white/20 bg-white/20 p-5 text-white shadow-md backdrop-blur-xs cursor-pointer',
      'flex flex-col items-center justify-center size-60 m-10 text-3xl text-center rounded-full capitalize select-none',
      breathingState.active ? breathingState.phase : '',
    ]}
  >
    {#if breathingState.active}
      {#key breathingState.phase}
        <span in:fade={{ duration: 600 }}>
          {breathingState.phaseLabel}
        </span>
      {/key}
    {/if}
    <span>{breathingState.timeLeft}</span>
  </button>
</div>

<style>
  .breathing-circle {
    transition-property: scale, background-color, border-color;
    transition-timing-function: ease-in-out;
    transition-duration: var(--phase-duration, 1s);
  }

  .inhale,
  .hold-in {
    scale: 150%;
  }

  .exhale,
  .hold-out {
    scale: 100%;
  }
</style>
