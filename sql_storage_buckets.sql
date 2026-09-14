-- =====================================================================================
-- SCRIPT DE CREACIÓN DE BUCKETS (STORAGE) Y POLÍTICAS DE ACCESO
-- =====================================================================================

-- 1. Crear el Bucket para los documentos de los Proveedores (PDFs, RUT, Cámara de Comercio)
insert into storage.buckets (id, name, public) 
values ('proveedores-docs', 'proveedores-docs', true)
on conflict (id) do nothing;

-- 2. Crear el Bucket para los logos de la empresa (Orden de Compra)
insert into storage.buckets (id, name, public) 
values ('logos-empresa', 'logos-empresa', true)
on conflict (id) do nothing;

-- 3. Crear el Bucket para las fotos de perfil de los usuarios
insert into storage.buckets (id, name, public) 
values ('fotos-perfil', 'fotos-perfil', true)
on conflict (id) do nothing;

-- =====================================================================================
-- POLÍTICAS DE SEGURIDAD (PERMITIR SUBIR Y LEER ARCHIVOS)
-- =====================================================================================

-- Políticas para proveedores-docs
create policy "Permitir lectura pública proveedores-docs" on storage.objects for select using (bucket_id = 'proveedores-docs');
create policy "Permitir subida autenticada proveedores-docs" on storage.objects for insert with check (bucket_id = 'proveedores-docs' and auth.role() = 'authenticated');
create policy "Permitir actualización autenticada proveedores-docs" on storage.objects for update with check (bucket_id = 'proveedores-docs' and auth.role() = 'authenticated');
create policy "Permitir eliminación autenticada proveedores-docs" on storage.objects for delete using (bucket_id = 'proveedores-docs' and auth.role() = 'authenticated');

-- Políticas para logos-empresa
create policy "Permitir lectura pública logos-empresa" on storage.objects for select using (bucket_id = 'logos-empresa');
create policy "Permitir subida autenticada logos-empresa" on storage.objects for insert with check (bucket_id = 'logos-empresa' and auth.role() = 'authenticated');
create policy "Permitir actualización autenticada logos-empresa" on storage.objects for update with check (bucket_id = 'logos-empresa' and auth.role() = 'authenticated');
create policy "Permitir eliminación autenticada logos-empresa" on storage.objects for delete using (bucket_id = 'logos-empresa' and auth.role() = 'authenticated');

-- Políticas para fotos-perfil
create policy "Permitir lectura pública fotos-perfil" on storage.objects for select using (bucket_id = 'fotos-perfil');
create policy "Permitir subida autenticada fotos-perfil" on storage.objects for insert with check (bucket_id = 'fotos-perfil' and auth.role() = 'authenticated');
create policy "Permitir actualización autenticada fotos-perfil" on storage.objects for update with check (bucket_id = 'fotos-perfil' and auth.role() = 'authenticated');
create policy "Permitir eliminación autenticada fotos-perfil" on storage.objects for delete using (bucket_id = 'fotos-perfil' and auth.role() = 'authenticated');
