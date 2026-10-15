import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { settingsStore } from '@/settings/index.svelte'

export type SupabaseCredentials = {
  url: string
  anonKey: string
}

export function getSupabaseCredentials(): SupabaseCredentials | null {
  const settingsUrl = settingsStore.supabase?.url?.trim()
  const settingsKey = settingsStore.supabase?.anonKey?.trim()

  const envUrl = (
    import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined
  )?.trim()
  const envKey = (
    import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined
  )?.trim()

  const url = settingsUrl || envUrl || ''
  const anonKey = settingsKey || envKey || ''

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

let cachedClient: SupabaseClient | null = null
let lastUrl = ''
let lastKey = ''

export function resetSupabaseClient(): void {
  cachedClient = null
  lastUrl = ''
  lastKey = ''
}

export function getSupabaseClient(): SupabaseClient | null {
  const credentials = getSupabaseCredentials()
  if (!credentials) {
    resetSupabaseClient()
    return null
  }

  if (
    cachedClient &&
    credentials.url === lastUrl &&
    credentials.anonKey === lastKey
  ) {
    return cachedClient
  }

  lastUrl = credentials.url
  lastKey = credentials.anonKey
  cachedClient = createClient(credentials.url, credentials.anonKey)
  return cachedClient
}
