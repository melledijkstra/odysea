<script lang="ts">
  import { fade } from 'svelte/transition'
  import Background from './Background.svelte'
  import Curtain from './Curtain.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    mode: string
    top?: Snippet
    middle?: Snippet
    bottom?: Snippet
  }

  const { mode, top, middle, bottom }: Props = $props()
</script>

<Background />
<Curtain />

<div class="h-screen snap-y snap-mandatory">
  <section
    class={[
      mode === 'focus' && 'bg-black/70',
      'grid grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] snap-start h-screen animate-fade-in transition-colors',
    ]}
  >
    <!-- TOP --->
    {#if top}
      {@render top()}
    {/if}

    <!-- MIDDLE --->
    {#key mode}
      <main
        transition:fade
        style="grid-area: 2 / 1"
        class="text-center place-self-center"
      >
        {#if middle}
          {@render middle()}
        {/if}
      </main>
    {/key}

    <!-- BOTTOM -->
    {#if bottom}
      {@render bottom()}
    {/if}
  </section>
</div>
