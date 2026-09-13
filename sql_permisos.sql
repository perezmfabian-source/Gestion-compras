-- ==========================================
-- SCRIPT PARA AÑADIR MATRIZ DE PERMISOS A USUARIOS
-- ==========================================

-- Añadir la columna 'permisos' de tipo JSONB a la tabla usuarios, si no existe
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '{}'::jsonb;

-- Nota: Si usaste una tabla diferente para los usuarios de este módulo, reemplaza 'public.usuarios'
-- Si ya tenías un usuario administrador creado, podemos asegurarle todos los permisos (opcional):
UPDATE public.usuarios
SET permisos = '{
  "ordenes": {"lectura": true, "escritura": true, "borrado": true, "especial": true},
  "almacen": {"lectura": true, "escritura": true, "borrado": true, "especial": true},
  "facturas": {"lectura": true, "escritura": true, "borrado": true, "especial": true},
  "cuentas": {"lectura": true, "escritura": true, "borrado": true, "especial": true},
  "proveedores": {"lectura": true, "escritura": true, "borrado": true, "especial": true},
  "configuracion": {"lectura": true, "escritura": true, "borrado": true, "especial": true},
  "usuarios": {"lectura": true, "escritura": true, "borrado": true, "especial": true}
}'::jsonb
WHERE rol = 'ADMINISTRADOR' OR email = 'admin@presupro.com';
