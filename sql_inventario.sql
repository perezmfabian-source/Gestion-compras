-- =====================================================================================
-- SCRIPT DE CREACIÓN DE TABLAS DE INVENTARIO Y HABILITACIÓN DE TIEMPO REAL
-- =====================================================================================

-- 1. Crear tabla de Inventario (Si no existe)
CREATE TABLE IF NOT EXISTS public.inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    descripcion TEXT NOT NULL,
    unidad TEXT DEFAULT 'Und',
    entradas NUMERIC DEFAULT 0,
    salidas NUMERIC DEFAULT 0,
    saldo NUMERIC DEFAULT 0,
    costo_promedio NUMERIC DEFAULT 0,
    valor_total NUMERIC DEFAULT 0,
    stock_minimo NUMERIC DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de Movimientos de Inventario (Kardex)
CREATE TABLE IF NOT EXISTS public.movimientos_inventario (
    id_movimiento TEXT PRIMARY KEY,
    tipo TEXT NOT NULL, -- 'ENTRADA' o 'SALIDA'
    sku TEXT NOT NULL REFERENCES public.inventario(sku) ON DELETE CASCADE,
    cantidad NUMERIC NOT NULL,
    costo_unitario NUMERIC NOT NULL,
    referencia TEXT,
    responsable TEXT,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- =====================================================================================
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública inventario" ON public.inventario FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada inventario" ON public.inventario FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Lectura pública movimientos" ON public.movimientos_inventario FOR SELECT USING (true);
CREATE POLICY "Escritura autenticada movimientos" ON public.movimientos_inventario FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================================================
-- HABILITAR REALTIME (TIEMPO REAL) PARA LA TABLA INVENTARIO
-- =====================================================================================
-- Agregamos la tabla inventario a la publicación de Supabase para que emita eventos
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.inventario;
COMMIT;

-- Aseguramos que emita la fila completa después de un UPDATE
ALTER TABLE public.inventario REPLICA IDENTITY FULL;
