import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let validUrl = supabaseUrl;
if (!validUrl || !validUrl.startsWith('http')) {
  console.warn('Faltan variables de entorno para Supabase válidas. Verifica tu archivo .env.local');
  validUrl = 'https://ejemplo.supabase.co'; // Fallback to prevent crash
}

export const supabase = createClient(validUrl, supabaseAnonKey || 'dummy_key')
