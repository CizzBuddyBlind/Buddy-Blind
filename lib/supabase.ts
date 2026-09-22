import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cfihskrrbqgvgnnxergj.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[STRIPPED 127 bytes].Xe04EG_adYY8Ev_QUi4R9DAFj2w0Evbl1pks2TUILko')
