import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QuotesState, DEFAULT_QUOTES, type Quote } from './quotes.state.svelte'
import type { SupabaseClient } from '@supabase/supabase-js'

const mockSelect = vi.fn()
const mockFrom = vi.fn().mockReturnValue({
  select: mockSelect,
})
const mockSupabase = {
  from: mockFrom as unknown as SupabaseClient['from'],
}

const mockGetSupabaseClient = vi.fn()

vi.mock('@/db/supabase', () => ({
  getSupabaseClient: () => mockGetSupabaseClient(),
}))

describe('QuotesState', () => {
  beforeEach(() => {
    mockSelect.mockReset()
    mockFrom.mockClear().mockReturnValue({
      select: mockSelect,
    })
    mockGetSupabaseClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with default fallback quotes and selected current quote', () => {
    const state = new QuotesState()

    expect(state.quotes.length).toBeGreaterThan(0)
    expect(state.quotes).toEqual(DEFAULT_QUOTES)
    expect(state.currentQuote).toBeDefined()
    expect(DEFAULT_QUOTES).toContainEqual(state.currentQuote)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  describe('selection & non-repeating random cycle', () => {
    it('selects a random quote from the available pool', () => {
      const state = new QuotesState()
      const sampleQuotes: Quote[] = [
        { quote: 'Quote 1', author: 'Author 1' },
        { quote: 'Quote 2', author: 'Author 2' },
      ]
      state.quotes = sampleQuotes

      const quote = state.selectRandomQuote()
      expect(sampleQuotes).toContainEqual(quote)
    })

    it('nextQuote updates currentQuote without repeating the current one if multiple exist', () => {
      const state = new QuotesState()
      const sampleQuotes: Quote[] = [
        { quote: 'Quote 1', author: 'Author 1' },
        { quote: 'Quote 2', author: 'Author 2' },
      ]
      state.quotes = sampleQuotes
      state.currentQuote = sampleQuotes[0]

      // Calling nextQuote should pick Quote 2, because Quote 1 is currently active
      state.nextQuote()
      expect(state.currentQuote).toEqual(sampleQuotes[1])

      // Next call should pick Quote 1
      state.nextQuote()
      expect(state.currentQuote).toEqual(sampleQuotes[0])
    })

    it('handles single-quote pool gracefully on nextQuote', () => {
      const state = new QuotesState()
      const singleQuote: Quote[] = [{ quote: 'Solo', author: 'One' }]
      state.quotes = singleQuote
      state.currentQuote = singleQuote[0]

      state.nextQuote()
      expect(state.currentQuote).toEqual(singleQuote[0])
    })
  })

  describe('fetchQuotes', () => {
    it('does not query and keeps default quotes when client getter returns null', async () => {
      mockGetSupabaseClient.mockReturnValue(null)
      const state = new QuotesState()

      await state.fetchQuotes()

      expect(mockFrom).not.toHaveBeenCalled()
      expect(state.quotes).toEqual(DEFAULT_QUOTES)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('fetches quotes from database, updates quotes pool, and selects a database quote', async () => {
      const dbQuotes: Quote[] = [
        { quote: 'DB Quote 1', author: 'DB Author 1' },
        { quote: 'DB Quote 2', author: 'DB Author 2' },
      ]
      mockSelect.mockResolvedValueOnce({
        data: dbQuotes,
        error: null,
      })

      const state = new QuotesState()

      await state.fetchQuotes()

      expect(mockFrom).toHaveBeenCalledWith('quotes')
      expect(mockSelect).toHaveBeenCalled()
      expect(state.quotes).toEqual(dbQuotes)
      expect(dbQuotes).toContainEqual(state.currentQuote)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('retains default fallback quotes and records error when database query fails', async () => {
      mockSelect.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const state = new QuotesState()

      await state.fetchQuotes()

      expect(state.quotes).toEqual(DEFAULT_QUOTES)
      expect(state.error).toBe('Database connection failed')
      expect(state.loading).toBe(false)
    })

    it('retains default fallback quotes when database returns empty array', async () => {
      mockSelect.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      const state = new QuotesState()

      await state.fetchQuotes()

      expect(state.quotes).toEqual(DEFAULT_QUOTES)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })
})
