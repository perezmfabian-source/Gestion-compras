import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('c:/Proyectos/Gestion compras/.env.local', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
  
  async function test() {
    let res = await supabase.from('feedback_pruebas').insert([{
        usuario_nombre: 'Sistema Automático',
        usuario_email: 'bot@sistema.local',
        mensaje: '¡Hola Fabián! El buzón está funcionando perfectamente. Cuando tus usuarios usen el botón flotante rojo abajo a la derecha, los mensajes aparecerán aquí mágicamente.',
        estado: 'PENDIENTE'
    }]);
    console.log('inserted:', res.error ? res.error.message : 'ok');
  }
  test();
}
