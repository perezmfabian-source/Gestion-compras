with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'r', encoding='utf-8') as f:
    code = f.read()

import re

# explicitly add password to insert payload
old_insert = """        const { data, error } = await supabase.from('usuarios').insert([{
          email: nuevoUsuario.correo,
          nombre: nuevoUsuario.nombre,
          rol: nuevoUsuario.rol,
          estado: 'Activo',
          permisos: nuevoUsuario.rol === 'ADMINISTRADOR' ? null : defaultPermisos
        }]).select();"""

new_insert = """        const { data, error } = await supabase.from('usuarios').insert([{
          email: nuevoUsuario.correo,
          nombre: nuevoUsuario.nombre,
          rol: nuevoUsuario.rol,
          estado: 'Activo',
          password: '123',
          permisos: nuevoUsuario.rol === 'ADMINISTRADOR' ? null : defaultPermisos
        }]).select();"""

code = code.replace(old_insert, new_insert)

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'w', encoding='utf-8') as f:
    f.write(code)

