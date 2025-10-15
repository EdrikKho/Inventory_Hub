import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wakkrwfzzrnsxqiimbnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha2tyd2Z6enJuc3hxaWltYm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTQxNjgsImV4cCI6MjA3MDk3MDE2OH0.W9Rulx4Yiy1LBOreYPZTzTN3pzRun0O6Wz3C9fD_Uak'
export const supabase = createClient(supabaseUrl, supabaseKey)