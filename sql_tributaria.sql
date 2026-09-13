-- ==========================================
-- SCRIPT PARA CONFIGURACIÓN TRIBUTARIA
-- ==========================================

-- 1. Crear la tabla de configuración global
CREATE TABLE IF NOT EXISTS public.configuracion (
    id VARCHAR(50) PRIMARY KEY,
    datos JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Desactivar RLS para que podamos leer/guardar sin problema en esta fase
ALTER TABLE public.configuracion DISABLE ROW LEVEL SECURITY;

-- 3. Insertar la configuración inicial por defecto (si no existe)
INSERT INTO public.configuracion (id, datos)
VALUES (
  'tributaria',
  '{
    "uvt": 52289,
    "conceptosRetefuente": [
      { "id": 1, "concepto": "Compras generales (declarantes)", "baseUvt": 27, "porcentaje": 2.5 },
      { "id": 2, "concepto": "Compras generales (no declarantes)", "baseUvt": 27, "porcentaje": 3.5 }
    ],
    "tarifasIca": [
      { "id": 1, "ciudad": "BOGOTA", "actividad": "Construcción", "tarifa": "9.66", "estado": "Activo" },
      { "id": 2, "ciudad": "MEDELLIN", "actividad": "Comercio", "tarifa": "10.00", "estado": "Activo" },
      { "id": 3, "ciudad": "BARRANQUILLA", "actividad": "Suministros", "tarifa": "10.00", "estado": "Activo" }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
