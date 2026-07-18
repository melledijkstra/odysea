<script lang="ts">
  import Icon from '@/components/atoms/Icon.svelte'
  import {
    mdiArrowLeft,
    mdiDelete,
    mdiPin,
    mdiPinOff,
    mdiPlus,
    mdiClockOutline,
    mdiCalendarClock,
    mdiNumeric,
    mdiBedOutline,
  } from '@mdi/js'
  import CountdownForm from './countdown/Form.svelte'
  import WorldClockForm from './world-clocks/Form.svelte'
  import Button from '@/components/atoms/Button.svelte'
  import Countdown from '@/components/atoms/metrics/Countdown.svelte'
  import { setIsSleepMetricEnabled, trackers } from './state.svelte'
  import WorldClock from '@/components/atoms/metrics/WorldClock.svelte'
  import { Popover } from 'bits-ui'
  import PopPanel from '@/components/atoms/PopPanel.svelte'
  import IconButton from '@/components/atoms/IconButton.svelte'

  type FormType = 'countdown' | 'worldclock' | 'sleep' | 'counter'

  let isOpen = $state(false)

  let currentForm = $state<FormType>()

  function showForm(formType: FormType) {
    currentForm = formType
  }

  function backToMain() {
    currentForm = undefined
  }

  function addSleepTracker() {
    setIsSleepMetricEnabled(true)
  }
</script>

<Popover.Root bind:open={isOpen}>
  <Popover.Trigger
    class={[
      isOpen ? 'opacity-100' : 'opacity-0',
      'group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 flex flex-col cursor-pointer',
      'text-center dark:text-white/70 dark:hover:text-white text-zinc-500 hover:text-zinc-700',
      'cursor-pointer transition-colors',
    ]}
  >
    <Icon path={mdiPlus} size={24} class="mx-auto" />
    <span class="text-xs">Add</span>
  </Popover.Trigger>
  <PopPanel panelProps={{ size: 'small' }}>
    {#if currentForm}
      <IconButton
        icon={mdiArrowLeft}
        size={20}
        onclick={() => (currentForm = undefined)}
        class="mb-2"
      />
    {/if}
    {#if !currentForm}
      <p class="text-lg text-center mb-6 font-bold dark:text-white text-black">
        Add Metric
      </p>
      <div class="grid grid-cols-2 gap-3 mb-6">
        <button
          onclick={() => showForm('countdown')}
          class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
        >
          <Icon
            path={mdiCalendarClock}
            size={24}
            class="mb-2 text-primary group-hover:scale-110 transition-transform"
          />
          <span class="text-xs font-medium dark:text-white text-black"
            >Countdown</span
          >
        </button>
        <button
          onclick={() => showForm('worldclock')}
          class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
        >
          <Icon
            path={mdiClockOutline}
            size={24}
            class="mb-2 text-primary group-hover:scale-110 transition-transform"
          />
          <span class="text-xs font-medium dark:text-white text-black"
            >World Clock</span
          >
        </button>
        <button
          onclick={() => showForm('counter')}
          class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
        >
          <Icon
            path={mdiNumeric}
            size={24}
            class="mb-2 text-primary group-hover:scale-110 transition-transform"
          />
          <span class="text-xs font-medium dark:text-white text-black"
            >Counter</span
          >
        </button>
        <button
          onclick={() => showForm('sleep')}
          class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
        >
          <Icon
            path={mdiBedOutline}
            size={24}
            class="mb-2 text-primary group-hover:scale-110 transition-transform"
          />
          <span class="text-xs font-medium dark:text-white text-black"
            >Sleep</span
          >
        </button>
      </div>

      {#if trackers.countdowns.length > 0 || trackers.worldClocks.length > 0 || trackers.counters.length > 0}
        <div class="space-y-2 mt-4 pt-4 border-t border-white/10">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2"
          >
            Active Metrics
          </p>
          {#each trackers.countdowns as countdown, i (i)}
            <div
              class="flex flex-row items-center justify-between gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item"
            >
              <div class="flex-1 min-w-0">
                <Countdown metric={countdown} />
              </div>
              <div
                class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <IconButton
                  icon={mdiDelete}
                  size={18}
                  onclick={() => trackers.deleteCountdown(i)}
                  class="hover:text-red-400"
                />
              </div>
            </div>
          {/each}
          {#each trackers.worldClocks as worldClock, i (i)}
            <div
              class="flex flex-row items-center justify-between gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item"
            >
              <div class="flex-1 min-w-0">
                <WorldClock metric={worldClock} />
              </div>
              <div
                class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <IconButton
                  icon={worldClock.pinned ? mdiPin : mdiPinOff}
                  size={18}
                  onclick={() => trackers.pinWorldClock(i, !worldClock.pinned)}
                  class={worldClock.pinned ? 'text-primary' : ''}
                />
                <IconButton
                  icon={mdiDelete}
                  size={18}
                  onclick={() => trackers.deleteWorldClock(i)}
                  class="hover:text-red-400"
                />
              </div>
            </div>
          {/each}
          {#each trackers.counters as counter, i (i)}
            <div
              class="flex flex-row items-center justify-between gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item"
            >
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-bold truncate leading-tight dark:text-white text-black"
                >
                  {counter.name}
                </p>
                <p
                  class="text-xs opacity-70 truncate dark:text-white text-black"
                >
                  {counter.value}
                </p>
              </div>
              <div
                class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <IconButton
                  icon={mdiDelete}
                  size={18}
                  onclick={() => trackers.deleteCounter(i)}
                  class="hover:text-red-400"
                />
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else if currentForm === 'countdown'}
      <h2 class="text-lg mb-3">Countdowns 🗓️</h2>
      <CountdownForm onSubmitted={backToMain} />
    {:else if currentForm === 'worldclock'}
      <h2 class="text-lg mb-3">World Clocks 🌎</h2>
      <WorldClockForm onSubmitted={backToMain} />
    {:else if currentForm === 'counter'}
      <h2 class="text-lg mb-3">Counters 🔢</h2>
      <!-- Placeholder for future counter form -->
      <p>Counter form not yet implemented.</p>
    {:else if currentForm === 'sleep'}
      <Button onclick={addSleepTracker}>Add sleep tracker</Button>
    {/if}
  </PopPanel>
</Popover.Root>
