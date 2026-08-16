<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
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
    mdiDrag,
  } from '@mdi/js'
  import CountdownForm from './countdown/Form.svelte'
  import CounterForm from './counter/Form.svelte'
  import WorldClockForm from './world-clocks/Form.svelte'
  import Countdown from '@/components/atoms/metrics/Countdown.svelte'
  import Clock from '@/components/atoms/metrics/WorldClock.svelte'
  import { trackers } from './state.svelte'
  import type { AnyMetric } from './types'
  import { Popover } from 'bits-ui'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import { dndzone, type DndEvent } from 'svelte-dnd-action'
  import { untrack } from 'svelte'

  type FormType = 'countdown' | 'worldclock' | 'counter'

  let currentForm = $state<FormType>()

  let items = $state<AnyMetric[]>([])
  let isDragging = $state(false)
  let isOpen = $state(false)

  function showForm(formType: FormType) {
    currentForm = formType
  }

  function backToMain() {
    currentForm = undefined
  }

  function toggleSleepTracker() {
    if (trackers.sleepEnabled) {
      trackers.setSleepEnabled(false)
    } else {
      trackers.setSleepEnabled(true)
    }
  }

  $effect(() => {
    const currentMetrics = trackers.allMetrics
    untrack(() => {
      if (!isDragging) {
        items = currentMetrics
      }
    })
  })

  function handleDndConsider(dragEvent: CustomEvent<DndEvent<AnyMetric>>) {
    isDragging = true
    items = dragEvent.detail.items as AnyMetric[]
  }

  function handleDndFinalize(dragEvent: CustomEvent<DndEvent<AnyMetric>>) {
    isDragging = false
    items = dragEvent.detail.items as AnyMetric[]
    trackers.setMetrics(items)
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
        onclick={() => backToMain()}
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
            >Date Countdown</span
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
          onclick={toggleSleepTracker}
          class={[
            'flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border group',
            trackers.sleepEnabled ? 'border-primary' : 'border-white/10',
          ]}
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

      {#if items.length > 0}
        <div class="space-y-2 mt-4 pt-4 border-t border-white/10">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2"
          >
            Active Metrics
          </p>
          <div
            use:dndzone={{ items, flipDurationMs: 300, dropTargetStyle: {} }}
            onconsider={handleDndConsider}
            onfinalize={handleDndFinalize}
            class="space-y-2"
          >
            {#each items as item (item.id)}
              <div
                class="flex flex-row items-center justify-between gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group/item"
              >
                <div
                  class="cursor-grab active:cursor-grabbing text-white/40 hover:text-white"
                >
                  <Icon path={mdiDrag} size={20} />
                </div>
                <div class="flex-1 min-w-0">
                  {#if item.type === 'countdown'}
                    <Countdown metric={item} />
                  {:else if item.type === 'worldClock'}
                    <Clock metric={item} />
                  {:else if item.type === 'counter'}
                    <p
                      class="text-sm font-bold truncate leading-tight dark:text-white text-black"
                    >
                      {item.name}
                    </p>
                    <p
                      class="text-xs opacity-70 truncate dark:text-white text-black"
                    >
                      {item.value}
                    </p>
                  {:else if item.type === 'sleep'}
                    <div
                      class="text-sm font-bold truncate leading-tight dark:text-white text-black"
                    >
                      Sleep
                    </div>
                  {/if}
                </div>
                <div
                  class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  {#if item.type === 'worldClock'}
                    <IconButton
                      icon={item.pinned ? mdiPin : mdiPinOff}
                      size={18}
                      onclick={() => trackers.pinMetric(item.id, !item.pinned)}
                      class={item.pinned ? 'text-primary' : ''}
                    />
                  {/if}
                  <IconButton
                    icon={mdiDelete}
                    size={18}
                    onclick={() => trackers.deleteMetric(item.id)}
                    class="hover:text-red-400"
                  />
                </div>
              </div>
            {/each}
          </div>
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
      <CounterForm onSubmitted={backToMain} />
    {/if}
  </PopPanel>
</Popover.Root>
