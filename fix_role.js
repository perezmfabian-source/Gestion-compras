import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    const { data: users, error: fetchErr } = await supabase.from('usuarios').select('*').eq('email', 'comprasylogistica.cartagena@bustilloingenieria.com');
    console.log('User:', users);
    
    if (users && users.length > 0) {
      const { error: updateErr } = await supabase.from('usuarios').update({ rol: 'ANALISTA COMPRAS' }).eq('id', users[0].id);
      console.log('Update err:', updateErr);
    }
  }
  test();
}
