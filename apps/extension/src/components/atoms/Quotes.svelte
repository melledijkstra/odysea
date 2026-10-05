<script lang="ts">
  import { quotesState } from '@/modules/quotes/quotes.state.svelte'
  import { addNotification } from '@/stores/notifications.svelte'
  import Icon from '@melledijkstra/ui/svelte/Icon.svelte'
  import { mdiRefresh } from '@mdi/js'

  $effect(() => {
    quotesState.fetchQuotes()
  })

  async function copyQuote() {
    const quote = quotesState.currentQuote
    const copyText = `${quote.quote} - ${quote.author}`
    await navigator.clipboard.writeText(copyText)
    addNotification('Copied to clipboard!', 'success')
  }
</script>

<div class="group relative flex items-center justify-center gap-2 text-center">
  <button
    onclick={copyQuote}
    class="cursor-pointer"
    title="Click to copy quote"
  >
    <em
      class={[
        'inline-block text-lg text-white/50 group-hover:text-white',
        'transition-all duration-300 ease-in will-change-transform whitespace-nowrap',
        'translate-y-0 group-hover:-translate-y-1/2',
      ]}>"{quotesState.currentQuote.quote}"</em
    >
    <p
      class={[
        'inline-block text-sm text-gray-200',
        'transition-all duration-300 ease-in will-change-transform whitespace-nowrap',
        'translate-y-0 group-hover:translate-y-1/2',
        'opacity-0 group-hover:opacity-100',
        'absolute left-0 right-0',
      ]}
    >
      {quotesState.currentQuote.author}
    </p>
  </button>

  {#if quotesState.quotes.length > 1}
    <button
      onclick={(e) => {
        e.stopPropagation()
        quotesState.nextQuote()
      }}
      title="Next quote"
      class="opacity-0 group-hover:opacity-60 hover:opacity-100! text-white/70 hover:text-white transition-opacity duration-200 cursor-pointer p-1 rounded-full hover:bg-white/10"
      aria-label="Next quote"
    >
      <Icon path={mdiRefresh} size={16} />
    </button>
  {/if}
</div>
