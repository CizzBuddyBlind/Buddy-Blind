import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ueiamwwozqgnybybyssv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWFtd3dvenFnbnlieWJ5c3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDE2MzUsImV4cCI6MjA3Mzc3NzYzNX0.m_eI7-1qgfJHi1e3u2y0jziqWgUL1b9u4b5g6v2k2o0'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
