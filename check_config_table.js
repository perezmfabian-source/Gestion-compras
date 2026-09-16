import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    const { data: { user } } = await supabase.auth.getUser(); // this won't work, we don't have auth
    
    // just try fetching from configuracion or configuracion_sistema
    let res = await supabase.from('configuracion_sistema').select('*').limit(1);
    console.log('configuracion_sistema:', res.error ? res.error.message : res.data);

    res = await supabase.from('configuracion').select('*').limit(1);
    console.log('configuracion:', res.error ? res.error.message : res.data);
  }
  test();
}
