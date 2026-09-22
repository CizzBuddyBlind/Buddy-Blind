import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://ueiamwwozqgnybybyssv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaWFtd3dvemFnbnlieWJ5c3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NjgyODcsImV4cCI6MjA2NDA0NDI4N30.m_eI7-1qgfJHi1e3u2y0jziqWgUL1b9u4b5g6v2k2o0'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
