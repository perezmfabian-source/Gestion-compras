import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gaqoctwdttwddivhuxcz.supabase.co';
const supabaseKey = 'sb_publishable_LJxs2OGw_qSplV_XWc4N2A_oq3PLPUT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing insert order...");
  const { data, error } = await supabase.from('ordenes_compra').upsert([{
    consecutivo: 'OC-001',
    fecha: '2026-09-13',
    proveedor_nit: '891.412.809-2', 
    centro_costo_id: 'BUS-TER-09-26',
    subtotal: 1000
  }], { onConflict: 'consecutivo' });
  console.log({ data, error });
}

test();
