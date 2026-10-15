import { getSupabaseClient } from '@/db/supabase'
import { Logger } from '@/logger'
import { WebLocalStorage } from '@melledijkstra/storage'

export type Quote = {
  id?: string | number
  quote: string
  author: string
  link?: string
}

export const DEFAULT_QUOTES: Quote[] = [
  {
    quote: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    quote: 'The best way to predict the future is to invent it.',
    author: 'Alan Kay',
  },
  {
    quote: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
  },
]

export const QUOTES_STORAGE_KEY = 'quotes::cache'

export class QuotesState {
  private logger = new Logger('QuotesState')
  private cache = new WebLocalStorage()
  private initPromise: Promise<void> | null = null

  quotes = $state<Quote[]>([...DEFAULT_QUOTES])
  currentQuote = $state<Quote>(DEFAULT_QUOTES[0])
  loading = $state(false)
  error = $state<string | null>(null)
  hasLoaded = $state(false)
  hasCustomQuotes = $state(false)

  constructor() {
    this.currentQuote = this.selectRandomQuote(this.quotes)
  }

  /**
   * Initializes state by loading quotes from cache if available.
   */
  async initialize(): Promise<void> {
    if (this.hasLoaded) return
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      try {
        const cached = await this.cache.get<Quote[]>(QUOTES_STORAGE_KEY)
        if (cached && cached.length > 0) {
          this.quotes = cached
          this.currentQuote = this.selectRandomQuote(cached)
          this.hasCustomQuotes = true
        }
      } catch (e) {
        this.logger.error('Failed to load quotes from cache', e)
      } finally {
        this.hasLoaded = true
        this.initPromise = null
      }
    })()

    return this.initPromise
  }

  /**
   * Helper to check if a quote matches any of the default fallback quotes.
   */
  isDefaultQuote(quote: Quote | null): boolean {
    if (!quote) return false
    return DEFAULT_QUOTES.some(
      (dq) => dq.quote === quote.quote && dq.author === quote.author
    )
  }

  /**
   * Selects a random quote from the provided pool or available quotes.
   */
  selectRandomQuote(pool: Quote[] = this.quotes): Quote {
    if (!pool || pool.length === 0) {
      return DEFAULT_QUOTES[0]
    }
    const index = Math.floor(Math.random() * pool.length)
    return pool[index]
  }

  /**
   * Cycles to the next quote, ensuring it does not repeat the current quote if multiple quotes are available.
   */
  nextQuote(): void {
    if (this.quotes.length <= 1) {
      if (this.quotes.length === 1) {
        this.currentQuote = this.quotes[0]
      }
      return
    }

    const eligible = this.quotes.filter(
      (q) =>
        q.quote !== this.currentQuote.quote ||
        q.author !== this.currentQuote.author
    )

    this.currentQuote = this.selectRandomQuote(
      eligible.length > 0 ? eligible : this.quotes
    )
  }

  /**
   * Fetches quotes from the configured Supabase database.
   * If credentials are not configured or fetch fails, falls back gracefully to default quotes.
   * Updates cache in background and only swaps currentQuote if it was a default quote or deleted from DB.
   */
  async fetchQuotes(): Promise<void> {
    if (!this.hasLoaded) {
      await this.initialize()
    }

    const client = getSupabaseClient()
    if (!client) {
      this.logger.log('Supabase client is not configured, using default quotes')
      return
    }

    this.loading = true
    this.error = null

    try {
      const { data, error } = await client.from('quotes').select('*')

      if (error) {
        this.logger.error('Failed to fetch quotes from Supabase', error)
        this.error = error.message
        return
      }

      if (data && data.length > 0) {
        const parsedQuotes: Quote[] = data.map((item) => ({
          id: item.id,
          quote: item.quote,
          author: item.author || 'Unknown',
          link: item.link,
        }))
        this.quotes = parsedQuotes
        await this.cache.set(QUOTES_STORAGE_KEY, parsedQuotes)

        const isCurrentQuoteInPool = parsedQuotes.some(
          (q) =>
            q.quote === this.currentQuote.quote &&
            q.author === this.currentQuote.author
        )

        // Only swap currentQuote if:
        // 1. We didn't have custom cached quotes (showing default quotes), OR
        // 2. The active quote is a default quote, OR
        // 3. The active quote is no longer in the pool (e.g. deleted from DB)
        if (
          !this.hasCustomQuotes ||
          this.isDefaultQuote(this.currentQuote) ||
          !isCurrentQuoteInPool
        ) {
          this.currentQuote = this.selectRandomQuote(parsedQuotes)
        }

        this.hasCustomQuotes = true
      } else {
        this.logger.log('Supabase returned 0 quotes, keeping fallback quotes')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error('Unexpected error fetching quotes', err)
      this.error = message
    } finally {
      this.loading = false
    }
  }

  /**
   * Clears cached quotes and resets state to default fallback quotes.
   */
  async clearCache(): Promise<void> {
    await this.cache.delete(QUOTES_STORAGE_KEY)
    this.hasCustomQuotes = false
    this.quotes = [...DEFAULT_QUOTES]
    this.currentQuote = this.selectRandomQuote(this.quotes)
  }
}

export const quotesState = new QuotesState()
