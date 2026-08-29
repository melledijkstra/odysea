import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

console.log(import.meta.env)
console.log(supabaseUrl, supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Publishable Key')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
