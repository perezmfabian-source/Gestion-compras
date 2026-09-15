import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    const { error } = await supabase.from('proveedores').upsert([{
      nit: '999999999-9',
      razon_social: 'TEST',
      email: 'test@test.com',
      direccion: 'TEST',
      ciudad: 'TEST',
      telefono: 'TEST',
      celular: 'TEST',
      vendedor: 'TEST',
      perfil_tributario: 'TEST',
      actividad_economica: 'TEST',
      forma_pago: 'TEST',
      documentos: []
    }]);
    console.log('Upsert error:', JSON.stringify(error, null, 2));
    
    if (!error) {
      await supabase.from('proveedores').delete().eq('nit', '999999999-9');
    }
  }
  test();
}
