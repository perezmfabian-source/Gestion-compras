import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    const { error } = await supabase.from('usuarios').insert([{
      nombre: 'test',
      email: 'test@test.com',
      rol: 'ALMACENISTA'
    }]);
    console.log('Insert error:', error);
    if (!error) {
      await supabase.from('usuarios').delete().eq('email', 'test@test.com');
    }
  }
  test();
}
