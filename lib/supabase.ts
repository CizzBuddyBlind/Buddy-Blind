import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cfihskrrbqgvgnnxergj.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaWhza3JyYnFndmduanhlcmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzA1MTcsImV4cCI6MjA3MzQ0NjUxN30.Xe04EG_adYY8Ev_QUi4R9DAFj2w0Evbl1pks2TUILko';
export const supabase = createClient(url, key);
