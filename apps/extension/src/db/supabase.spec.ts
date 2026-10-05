import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { settingsStore } from '@/settings/index.svelte'
import {
  getSupabaseCredentials,
  getSupabaseClient,
  resetSupabaseClient,
} from './supabase'

describe('Supabase Client Factory', () => {
  beforeEach(() => {
    resetSupabaseClient()
    settingsStore.supabase = {
      url: '',
      anonKey: '',
    }
    vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    resetSupabaseClient()
  })

  describe('getSupabaseCredentials', () => {
    it('returns null when neither settings nor env vars are set', () => {
      expect(getSupabaseCredentials()).toBeNull()
    })

    it('returns credentials from settingsStore.supabase when configured', () => {
      settingsStore.supabase = {
        url: 'https://custom-project.supabase.co',
        anonKey: 'custom-anon-key',
      }

      expect(getSupabaseCredentials()).toEqual({
        url: 'https://custom-project.supabase.co',
        anonKey: 'custom-anon-key',
      })
    })

    it('falls back to environment variables when settings are empty', () => {
      vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', 'https://env-project.supabase.co')
      vi.stubEnv('VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'env-anon-key')

      expect(getSupabaseCredentials()).toEqual({
        url: 'https://env-project.supabase.co',
        anonKey: 'env-anon-key',
      })
    })

    it('prefers settingsStore.supabase over environment variables', () => {
      vi.stubEnv('VITE_PUBLIC_SUPABASE_URL', 'https://env-project.supabase.co')
      vi.stubEnv('VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'env-anon-key')

      settingsStore.supabase = {
        url: 'https://settings-project.supabase.co',
        anonKey: 'settings-anon-key',
      }

      expect(getSupabaseCredentials()).toEqual({
        url: 'https://settings-project.supabase.co',
        anonKey: 'settings-anon-key',
      })
    })
  })

  describe('getSupabaseClient', () => {
    it('returns null without throwing when credentials are not configured', () => {
      expect(() => getSupabaseClient()).not.toThrow()
      expect(getSupabaseClient()).toBeNull()
    })

    it('instantiates and returns a Supabase client when credentials are present', () => {
      settingsStore.supabase = {
        url: 'https://example.supabase.co',
        anonKey: 'test-anon-key',
      }

      const client = getSupabaseClient()
      expect(client).not.toBeNull()
      expect(client).toBeDefined()
    })

    it('caches the client instance across multiple calls with same credentials', () => {
      settingsStore.supabase = {
        url: 'https://example.supabase.co',
        anonKey: 'test-anon-key',
      }

      const client1 = getSupabaseClient()
      const client2 = getSupabaseClient()
      expect(client1).toBe(client2)
    })

    it('re-creates the client instance when credentials change', () => {
      settingsStore.supabase = {
        url: 'https://example-1.supabase.co',
        anonKey: 'key-1',
      }
      const client1 = getSupabaseClient()

      settingsStore.supabase = {
        url: 'https://example-2.supabase.co',
        anonKey: 'key-2',
      }
      const client2 = getSupabaseClient()

      expect(client1).not.toBe(client2)
    })
  })
})
