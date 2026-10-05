import { getSupabaseClient } from '@/db/supabase'
import { Logger } from '@/logger'

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

export class QuotesState {
  private logger = new Logger('QuotesState')

  quotes = $state<Quote[]>([...DEFAULT_QUOTES])
  currentQuote = $state<Quote>(DEFAULT_QUOTES[0])
  loading = $state(false)
  error = $state<string | null>(null)

  constructor() {
    this.currentQuote = this.selectRandomQuote(this.quotes)
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
   */
  async fetchQuotes(): Promise<void> {
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
        this.currentQuote = this.selectRandomQuote(parsedQuotes)
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
}

export const quotesState = new QuotesState()
