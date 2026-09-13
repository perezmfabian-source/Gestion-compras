import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gaqoctwdttwddivhuxcz.supabase.co';
const supabaseKey = 'sb_publishable_LJxs2OGw_qSplV_XWc4N2A_oq3PLPUT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing auth...");
  const { data, error } = await supabase.from('proveedores').upsert([{
    nit: '12345',
    razon_social: 'TEST CO',
    forma_pago: 'Contado'
  }], { onConflict: 'nit' });
  console.log({ data, error });
}

test();
