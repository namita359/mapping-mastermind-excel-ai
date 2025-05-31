
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iqckwjkndvbftbivyatt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY2t3amtuZHZiZnRiaXZ5YXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTc0MjQsImV4cCI6MjA2NDEzMzQyNH0.VHTgPt6sU2ZgWkGlmp8_tqcO6u6EUy4m__RW5-sDYk0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
