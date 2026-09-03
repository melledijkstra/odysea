<script lang="ts">
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import {
    mdiArrowLeft,
    mdiDelete,
    mdiPin,
    mdiPinOff,
    mdiClockOutline,
    mdiCalendarClock,
    mdiNumeric,
    mdiBedOutline,
    mdiDrag,
  } from '@mdi/js'
  import CountdownForm from './countdown/Form.svelte'
  import CounterForm from './counter/Form.svelte'
  import WorldClockForm from './worldclock/Form.svelte'
  import { trackers } from './state.svelte'
  import type { Tracker } from './tracker.svelte'
  import { Popover } from 'bits-ui'
  import PopPanel from '@melledijkstra/ui/svelte/PopPanel.svelte'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import { dndzone, type DndEvent } from 'svelte-dnd-action'
  import { onMount, untrack, type Snippet } from 'svelte'

  type FormType = 'countdown' | 'worldclock' | 'counter'

  export type TriggerProps = {
    isOpen: boolean
  }

  let { trigger }: { trigger: Snippet<[TriggerProps]> } = $props()

  let currentForm = $state<FormType>()

  let items = $state<Tracker[]>([])
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

  function toggleGmailTracker() {
    if (trackers.gmailEnabled) {
      trackers.setGmailEnabled(false)
    } else {
      trackers.setGmailEnabled(true)
    }
  }

  $effect(() => {
    const currentMetrics = trackers.metrics
    untrack(() => {
      if (!isDragging) {
        items = currentMetrics
      }
    })
  })

  function handleDndConsider(dragEvent: CustomEvent<DndEvent<Tracker>>) {
    isDragging = true
    items = dragEvent.detail.items
  }

  function handleDndFinalize(dragEvent: CustomEvent<DndEvent<Tracker>>) {
    isDragging = false
    items = dragEvent.detail.items
    trackers.setMetrics(items)
  }

  onMount(() => {
    trackers.initialize()
  })
</script>

<Popover.Root bind:open={isOpen}>
  {@render trigger({ isOpen })}
  <PopPanel panelProps={{ size: 'small' }}>
    {#if currentForm}
      <div class="flex flex-row gap-2 items-center mb-3">
        <IconButton
          icon={mdiArrowLeft}
          size={20}
          onclick={() => backToMain()}
          aria-label="Back"
          title="Back"
        />
        <h2 class="capitalize text-lg">{currentForm}</h2>
      </div>
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
        <button
          onclick={toggleGmailTracker}
          class={[
            'flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border group',
            trackers.gmailEnabled ? 'border-primary' : 'border-white/10',
          ]}
        >
          <img
            src="/icons/google-gmail.svg"
            alt="Gmail"
            class="w-6 h-6 mb-2 group-hover:scale-110 transition-transform"
          />
          <span class="text-xs font-medium dark:text-white text-black"
            >Gmail</span
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
                  <p
                    class="text-sm font-bold truncate leading-tight dark:text-white text-black"
                  >
                    {item.name ?? item.type}
                  </p>
                  <p
                    class="text-xs opacity-70 truncate dark:text-white text-black"
                  >
                    {item.formatValue?.()}
                  </p>
                </div>
                <div
                  class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <IconButton
                    icon={item.pinned ? mdiPin : mdiPinOff}
                    size={18}
                    onclick={() => trackers.pinMetric(item.id, !item.pinned)}
                    class={item.pinned ? 'text-primary' : ''}
                    aria-label={item.pinned ? 'Unpin metric' : 'Pin metric'}
                    title={item.pinned ? 'Unpin metric' : 'Pin metric'}
                  />
                  <IconButton
                    icon={mdiDelete}
                    size={18}
                    onclick={() => trackers.deleteMetric(item.id)}
                    class="hover:text-red-400"
                    aria-label="Delete metric"
                    title="Delete metric"
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {:else if currentForm === 'countdown'}
      <CountdownForm onSubmitted={backToMain} />
    {:else if currentForm === 'worldclock'}
      <WorldClockForm onSubmitted={backToMain} />
    {:else if currentForm === 'counter'}
      <CounterForm onSubmitted={backToMain} />
    {/if}
  </PopPanel>
</Popover.Root>
