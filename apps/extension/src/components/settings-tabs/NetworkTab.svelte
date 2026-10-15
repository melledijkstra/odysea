<script lang="ts">
  import Input from '@melledijkstra/ui/svelte/Input.svelte'
  import type { SettingsState } from '@/settings/index.svelte'
  import { settings, settingsStore } from '@/settings/index.svelte'

  let databaseUri = $state(settingsStore.network.databaseUri)
  let serverlessHost = $state(settingsStore.network.serverlessHost)

  let supabaseUrl = $state(settingsStore.supabase.url)
  let supabaseAnonKey = $state(settingsStore.supabase.anonKey)

  const envSupabaseUrl =
    (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined)?.trim() ||
    ''
  const envSupabaseAnonKey =
    (
      import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined
    )?.trim() || ''

  const onKeyDown = (
    e: KeyboardEvent,
    settingsKey: keyof SettingsState['network'],
    value: string
  ) => {
    if (e.key === 'Enter') {
      settingsStore.network[settingsKey] = value
      settings.saveSettingsToStorage()
    }
  }

  const saveSupabase = (
    key: keyof SettingsState['supabase'],
    value: string
  ) => {
    settingsStore.supabase[key] = value
    settings.saveSettingsToStorage()
  }

  const onKeyDownSupabase = (
    e: KeyboardEvent,
    key: keyof SettingsState['supabase'],
    value: string
  ) => {
    if (e.key === 'Enter') {
      saveSupabase(key, value)
    }
  }
</script>

<h1 class="text-xl mb-2">Network Settings</h1>
<Input
  class="mb-2"
  label="Database URI"
  type="url"
  bind:value={databaseUri}
  onkeydown={(e) => onKeyDown(e, 'databaseUri', databaseUri)}
  onchange={() => {
    settingsStore.network.databaseUri = databaseUri
    settings.saveSettingsToStorage()
  }}
/>
<Input
  class="mb-6"
  label="Serverless Host"
  type="url"
  pattern="https?://.+"
  bind:value={serverlessHost}
  onkeydown={(e) => onKeyDown(e, 'serverlessHost', serverlessHost)}
  onchange={() => {
    settingsStore.network.serverlessHost = serverlessHost
    settings.saveSettingsToStorage()
  }}
/>

<h1 class="text-xl mb-2">Supabase Settings</h1>
<p class="text-xs text-gray-400 mb-3">
  Configure your Supabase project for dynamic quotes and remote data.
  {#if envSupabaseUrl && !settingsStore.supabase.url}
    <span class="text-emerald-400 block mt-1">
      Active: using environment fallback URL
    </span>
  {/if}
</p>
<Input
  class="mb-2"
  label="Supabase URL"
  type="url"
  placeholder={envSupabaseUrl || 'https://xyzcompany.supabase.co'}
  bind:value={supabaseUrl}
  onkeydown={(e) => onKeyDownSupabase(e, 'url', supabaseUrl)}
  onchange={() => saveSupabase('url', supabaseUrl)}
/>
<Input
  label="Supabase Anon / Publishable Key"
  type="password"
  placeholder={envSupabaseAnonKey
    ? '•••••••••••••••• (from environment)'
    : 'eyJhbGciOi...'}
  bind:value={supabaseAnonKey}
  onkeydown={(e) => onKeyDownSupabase(e, 'anonKey', supabaseAnonKey)}
  onchange={() => saveSupabase('anonKey', supabaseAnonKey)}
/>
