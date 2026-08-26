# Implementation Plan: Universal Data-Driven Tracker Component

Refactor the tracker system in `apps/extension` to use a **Universal Component (Data-Driven UI)** architecture. This replaces individual `.svelte` tracker components (`Counter.svelte`, `Countdown.svelte`, `Gmail.svelte`, `Sleep.svelte`, `WorldClockTracker.svelte`) with a single reusable `<TrackerWidget {metric} />` driven by reactive state interfaces.

---

## Architecture Overview

```mermaid
graph TD
    A[MetricsBar.svelte] -->|iterates pinnedMetrics| B[TrackerWidget.svelte]
    B -->|reads formatValue/name/icon| C[Tracker Base Class]
    C <|-- D[Counter]
    C <|-- E[Countdown]
    C <|-- F[WorldClock]
    C <|-- G[OAuthTracker / Gmail & Sleep]
    B -->|renders actions if present| H[Tracker Actions +/- buttons]
    B -->|renders auth toggle if unauthenticated| I[OAuth Toggle View]
```

---

## Step-by-Step Implementation

### Step 1: Core Tracker Models & Interfaces

#### [MODIFY] [apps/extension/src/modules/trackers/tracker.svelte.ts](file:///Users/dijksmel/projects/odysea/apps/extension/src/modules/trackers/tracker.svelte.ts)

Add declarative UI capabilities to the base `Tracker` class:

```ts
export interface TrackerAction {
  id: string
  icon: string
  ariaLabel?: string
  onClick: () => void
}

export abstract class Tracker implements BaseTracker {
  id: string
  abstract readonly type: string
  name?: string
  pinned: boolean = $state(false)
  icon?: string

  get actions(): TrackerAction[] {
    return []
  }

  get needsAuth(): boolean {
    return false
  }

  authenticate?(): Promise<void>

  abstract formatValue(): string
  destroy?(): void
}
```

#### [MODIFY] [apps/extension/src/modules/trackers/counter/counter.svelte.ts](file:///Users/dijksmel/projects/odysea/apps/extension/src/modules/trackers/counter/counter.svelte.ts)

Expose action buttons for increment/decrement using `@mdi/js` icons (`mdiMinus`, `mdiPlus`):

```ts
import { mdiMinus, mdiPlus } from '@mdi/js'
import { trackers } from '../state.svelte'
import type { TrackerAction } from '../tracker.svelte'

// inside Counter class:
override get actions(): TrackerAction[] {
  return [
    {
      id: 'decrement',
      icon: mdiMinus,
      ariaLabel: 'Decrement',
      onClick: () => {
        this.decrement()
        trackers.setMetrics(trackers.metrics)
      },
    },
    {
      id: 'increment',
      icon: mdiPlus,
      ariaLabel: 'Increment',
      onClick: () => {
        this.increment()
        trackers.setMetrics(trackers.metrics)
      },
    },
  ]
}
```

#### [MODIFY] [apps/extension/src/modules/trackers/worldclock/worldclock.svelte.ts](file:///Users/dijksmel/projects/odysea/apps/extension/src/modules/trackers/worldclock/worldclock.svelte.ts)

Encapsulate the minute ticker and `onPageVisible` listener inside the `WorldClock` state class so that UI rendering remains purely presentational.

#### [MODIFY] [apps/extension/src/modules/trackers/gmail/gmail.svelte.ts](file:///Users/dijksmel/projects/odysea/apps/extension/src/modules/trackers/gmail/gmail.svelte.ts) & [apps/extension/src/modules/trackers/sleep/sleep.svelte.ts](file:///Users/dijksmel/projects/odysea/apps/extension/src/modules/trackers/sleep/sleep.svelte.ts)

Move the client API fetch, caching (`WebLocalStorage`), and OAuth logic into the state class or an `OAuthTracker` base class:

- Set `icon = '/icons/google-gmail.svg'` / `icon = '/icons/google-health.svg'`.
- Expose reactive `authenticated: boolean` and `authenticate(): Promise<void>`.
- Return `get needsAuth(): boolean { return !this.authenticated }`.

---

### Step 2: Universal UI Component

#### [NEW] [apps/extension/src/components/trackers/TrackerWidget.svelte](file:///Users/dijksmel/projects/odysea/apps/extension/src/components/trackers/TrackerWidget.svelte)

Create a single reusable widget:

```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import { Tracker } from '@melledijkstra/ui/svelte'
  import IconButton from '@melledijkstra/ui/svelte/IconButton.svelte'
  import Toggle from '@melledijkstra/ui/svelte/Toggle.svelte'
  import type { Tracker as TrackerModel } from '@/modules/trackers/tracker.svelte'

  const {
    metric,
    ...props
  }: { metric: TrackerModel } & HTMLAttributes<HTMLDivElement> = $props()
</script>

{#if metric.needsAuth}
  <div class="flex flex-col gap-1 items-center" {...props}>
    {#if metric.icon}
      <img src={metric.icon} class="w-[2em]" alt={metric.name} />
    {/if}
    <Toggle
      toggleSize="small"
      checked={false}
      onclick={() => metric.authenticate?.()}
    />
  </div>
{:else}
  <div transition:fade {...props}>
    <Tracker.Root
      class={[
        'group/tracker flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2 py-2 rounded-lg border border-white/10 transition-colors relative overflow-hidden',
        props.class,
      ]}
    >
      <Tracker.Metric>{metric.formatValue()}</Tracker.Metric>
      {#if metric.icon}
        <Tracker.IconTitle src={metric.icon} alt={metric.name ?? ''}>
          {metric.name}
        </Tracker.IconTitle>
      {:else}
        <Tracker.Title>{metric.name}</Tracker.Title>
      {/if}

      {#if metric.actions.length > 0}
        <div
          class="flex flex-row opacity-0 group-hover/tracker:opacity-100 transition-opacity absolute bottom-0 inset-x-0 bg-slate-500/90 items-center justify-center border-l border-white/10"
        >
          {#each metric.actions as action (action.id)}
            <IconButton
              icon={action.icon}
              size={16}
              ariaLabel={action.ariaLabel}
              onclick={action.onClick}
              class="hover:text-primary p-0.5 rounded-none h-1/2 w-5 flex items-center justify-center"
            />
          {/each}
        </div>
      {/if}
    </Tracker.Root>
  </div>
{/if}
```

#### [DELETE] Remove obsolete individual tracker components:

- `apps/extension/src/components/trackers/Countdown.svelte`
- `apps/extension/src/components/trackers/Counter.svelte`
- `apps/extension/src/components/trackers/WorldClockTracker.svelte`
- `apps/extension/src/components/trackers/Sleep.svelte`
- `apps/extension/src/components/trackers/Gmail.svelte`

---

### Step 3: Topbar Integration

#### [MODIFY] [apps/extension/src/components/topbar/MetricsBar.svelte](file:///Users/dijksmel/projects/odysea/apps/extension/src/components/topbar/MetricsBar.svelte)

```svelte
<script lang="ts">
  import { trackers } from '@/modules/trackers/state.svelte'
  import TrackerWidget from '@/components/trackers/TrackerWidget.svelte'

  const pinnedMetrics = $derived.by(() => {
    return trackers.metrics.filter((metric) => metric.pinned)
  })
</script>

{#if pinnedMetrics.length > 0}
  <div class="flex flex-row gap-5 items-center">
    {#each pinnedMetrics as metric (metric.id)}
      <TrackerWidget {metric} />
    {/each}
  </div>
{/if}
```

---

## Verification Plan

### Automated Verification

Run the standard repository verification command:

```bash
pnpm run local:ci
```

This runs:

- `pnpm test` (Vitest unit tests for all tracker state models and tracker serialization)
- `svelte-check` / `tsc` (full type safety check)
- `eslint .`
- `prettier --check .`

### Manual Verification

1. Start development server: `pnpm dev:extension`.
2. Pin/unpin metrics from the `MetricsPanel`.
3. Check Counter increment/decrement action buttons on hover.
4. Verify WorldClock auto-updates on time / tab visibility.
5. Verify Gmail & Sleep OAuth authentication and metric fetching.
