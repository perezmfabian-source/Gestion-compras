import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    const fileContent = 'dummy content';
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const { data, error } = await supabase.storage.from('proveedores-docs').upload('test-upload.txt', blob, {
      upsert: true
    });
    
    console.log('Upload Result Data:', data);
    console.log('Upload Error:', error);
  }
  test();
}
