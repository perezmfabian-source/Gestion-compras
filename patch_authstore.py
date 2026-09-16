import re

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Update initAuth
old_init = """    initAuth: async () => {
      try {
        const { data, error } = await supabase.from('usuarios').select('*');"""

new_init = """    initAuth: async () => {
      try {
        // Fetch mantenimiento
        const { data: confData } = await supabase.from('configuracion').select('*').eq('id', 'sistema').single();
        if (confData && confData.datos) {
          set({ 
            modoMantenimiento: confData.datos.modoMantenimiento || false, 
            mensajeMantenimiento: confData.datos.mensajeMantenimiento || 'El administrador estǭ realizando actualizaciones en la plataforma para mejorar tu experiencia. Por favor, intenta ingresar mǭs tarde.'
          });
        }

        const { data, error } = await supabase.from('usuarios').select('*');"""
code = code.replace(old_init, new_init)

# Update toggleMantenimiento
old_toggle = """  toggleMantenimiento: (estado, mensaje) => set({ 
      modoMantenimiento: estado, 
      mensajeMantenimiento: mensaje 
    }),"""

new_toggle = """  toggleMantenimiento: async (estado, mensaje) => {
      set({ modoMantenimiento: estado, mensajeMantenimiento: mensaje });
      await supabase.from('configuracion').upsert([{ 
        id: 'sistema', 
        datos: { modoMantenimiento: estado, mensajeMantenimiento: mensaje } 
      }]);
    },"""
code = code.replace(old_toggle, new_toggle)

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'w', encoding='utf-8') as f:
    f.write(code)
