import { createClient } from '@supabase/supabase-js'
function cleanUrl(url) {
  if (!url) return url
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')
}
const supabaseUrl = cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
