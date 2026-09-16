import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    let res = await supabase.from('usuarios').update({ password: '123' }).is('password', null);
    console.log('updated null passwords to 123:', res.error ? res.error.message : 'ok');
  }
  test();
}
