import re

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'r', encoding='utf-8') as f:
    code = f.read()

fix_old = """        if (data && data.length > 0) {
          const users = data.map(u => ({
            id: u.id,
            nombre: u.nombre,
            correo: u.email,
            rol: u.rol,
            estado: u.estado,
            password: u.password || '123',
            permisos: u.permisos || (u.rol === 'ADMINISTRADOR' ? null : defaultPermisos),
            mfaEnabled: !!u.mfa_enabled,
            mfaSecret: u.mfa_secret || null
          }));
          
          // Fix ghost sessions
          const currentId = get().usuarioActual?.id;
          if (currentId && !users.find(u => u.id === currentId)) {
             localStorage.removeItem('auth_session');
             set({ usuarios: users, isInitialized: true, usuarioActual: null });
             return;
          }

          set({ usuarios: users, isInitialized: true });
"""

fix_new = """        if (data) {
          const users = data.map(u => ({
            id: u.id,
            nombre: u.nombre,
            correo: u.email,
            rol: u.rol,
            estado: u.estado,
            password: u.password || '123',
            permisos: u.permisos || (u.rol === 'ADMINISTRADOR' ? null : defaultPermisos),
            mfaEnabled: !!u.mfa_enabled,
            mfaSecret: u.mfa_secret || null
          }));
          
          // Fix ghost sessions
          const currentId = get().usuarioActual?.id;
          if (currentId && !users.find(u => u.id === currentId)) {
             localStorage.removeItem('auth_session');
             set({ usuarios: users, isInitialized: true, usuarioActual: null });
             return;
          }

          set({ usuarios: users, isInitialized: true });
        } else {
          set({ isInitialized: true });
"""

code = code.replace(fix_old, fix_new)

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'w', encoding='utf-8') as f:
    f.write(code)
