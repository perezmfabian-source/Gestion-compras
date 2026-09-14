import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    const { data: users, error: fetchErr } = await supabase.from('usuarios').select('*').limit(1);
    console.log('Fetch err:', fetchErr);
    if (users && users.length > 0) {
      console.log('User id:', users[0].id);
      const { error: updateErr } = await supabase.from('usuarios').update({ nombre: users[0].nombre + ' 1' }).eq('id', users[0].id);
      console.log('Update err:', updateErr);
      
      await supabase.from('usuarios').update({ nombre: users[0].nombre }).eq('id', users[0].id);
    }
  }
  test();
}
