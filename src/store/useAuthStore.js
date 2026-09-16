import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const usuariosIniciales = [
  { id: '1', nombre: 'ADMINISTRADOR', correo: 'admin@empresa.com', rol: 'ADMINISTRADOR', estado: 'ACTIVO', password: 'admin' },
  { id: '2', nombre: 'ANALISTA COMPRAS', correo: 'analista@empresa.com', rol: 'ANALISTA', estado: 'ACTIVO', password: '123' },
  { id: '3', nombre: 'PRESUPUESTADOR', correo: 'proyectos@empresa.com', rol: 'PRESUPUESTADOR', estado: 'ACTIVO', password: '123' }
];

const defaultPermisos = {
  ordenes: { lectura: true, escritura: true, borrado: false, especial: false },
  almacen: { lectura: true, escritura: true, borrado: false, especial: false },
  facturas: { lectura: true, escritura: true, borrado: false, especial: false },
  cuentas: { lectura: true, escritura: true, borrado: false, especial: false },
  proveedores: { lectura: true, escritura: true, borrado: false, especial: false },
  configuracion: { lectura: true, escritura: false, borrado: false, especial: false },
  usuarios: { lectura: false, escritura: false, borrado: false, especial: false }
};

export const useAuthStore = create((set, get) => ({
  usuarioActual: null,
  usuarios: usuariosIniciales,
  modoMantenimiento: false,
  mensajeMantenimiento: 'El administrador está realizando actualizaciones en la plataforma para mejorar tu experiencia. Por favor, intenta ingresar más tarde.',
  isInitialized: false,

  feedbacks: [],
  cargarFeedbacks: async () => {
    const { data } = await supabase.from('feedback_pruebas').select('*').order('created_at', { ascending: false });
    if (data) set({ feedbacks: data });
  },
  enviarFeedback: async (mensaje) => {
    const { usuarioActual } = get();
    if (!usuarioActual) return false;
    const { error } = await supabase.from('feedback_pruebas').insert([{
      usuario_nombre: usuarioActual.nombre,
      usuario_email: usuarioActual.correo,
      mensaje,
      estado: 'PENDIENTE'
    }]);
    return !error;
  },
  actualizarEstadoFeedback: async (id, nuevoEstado) => {
    const { error } = await supabase.from('feedback_pruebas').update({ estado: nuevoEstado }).eq('id', id);
    if (!error) {
      const { data } = await supabase.from('feedback_pruebas').select('*').order('created_at', { ascending: false });
      if (data) set({ feedbacks: data });
    }
  },

  initAuth: async () => {
    try {
      // Cargar configuracion de mantenimiento global
      const { data: confData } = await supabase.from('configuracion').select('*').eq('id', 'sistema').single();
      if (confData && confData.datos) {
        set({ 
          modoMantenimiento: confData.datos.modoMantenimiento || false, 
          mensajeMantenimiento: confData.datos.mensajeMantenimiento || 'El administrador está realizando actualizaciones...'
        });
      }

      const { data, error } = await supabase.from('usuarios').select('*');
      if (error) {
        console.warn('Error fetching usuarios from Supabase, using mock data:', error);
        set({ isInitialized: true });
        return;
      }
      
      
      if (data && data.length > 0) {
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
      }
    } catch (err) {
      console.warn('Network error fetching auth:', err);
      set({ isInitialized: true });
    }
  },

  tienePermiso: (modulo, accion = 'lectura') => {
    const { usuarioActual } = get();
    if (!usuarioActual) return false;
    if (usuarioActual.rol === 'ADMINISTRADOR') return true; // El admin siempre tiene todos los permisos
    
    // Si no tiene matriz configurada, usamos una restricción estricta por defecto
    if (!usuarioActual.permisos) return false;
    
    const moduloPermisos = usuarioActual.permisos[modulo];
    if (!moduloPermisos) return false;
    
    return !!moduloPermisos[accion];
  },

  iniciarSesion: (correo, password, codigo2FA = null) => {
    const { usuarios, modoMantenimiento } = get();
    const usuarioEncontrado = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password);
    
    if (!usuarioEncontrado) {
      return { exito: false, mensaje: 'Credenciales incorrectas' };
    }

    if (usuarioEncontrado.estado?.toUpperCase() !== 'ACTIVO') {
      return { exito: false, mensaje: 'Tu cuenta está inactiva' };
    }

    // Si está en mantenimiento, solo los admin pueden entrar
    if (modoMantenimiento && usuarioEncontrado.rol !== 'ADMINISTRADOR') {
      return { exito: false, mensaje: 'Mantenimiento' };
    }

    // Validación 2FA
    if (usuarioEncontrado.mfaEnabled) {
      if (!codigo2FA) {
        return { exito: false, requiere2FA: true, id: usuarioEncontrado.id, secret: usuarioEncontrado.mfaSecret };
      }
    }

    // Set user in local storage to keep session alive across refreshes temporarily (or we could rely on supabase auth later)
    localStorage.setItem('auth_session', JSON.stringify(usuarioEncontrado));
    set({ usuarioActual: usuarioEncontrado });
    return { exito: true };
  },

  completarLogin2FA: (usuarioId) => {
    const { usuarios } = get();
    const usuarioEncontrado = usuarios.find(u => u.id === usuarioId);
    if (usuarioEncontrado) {
      localStorage.setItem('auth_session', JSON.stringify(usuarioEncontrado));
      set({ usuarioActual: usuarioEncontrado });
    }
  },

  restaurarSesion: () => {
    const session = localStorage.getItem('auth_session');
    if (session) {
      try {
        set({ usuarioActual: JSON.parse(session) });
      } catch (e) {
        localStorage.removeItem('auth_session');
      }
    }
  },

  cerrarSesion: () => {
    localStorage.removeItem('auth_session');
    set({ usuarioActual: null });
  },

  actualizarPerfil: async (datos) => {
    const { usuarioActual, usuarios } = get();
    if (!usuarioActual) return;
    
    const usuarioActualizado = { ...usuarioActual, ...datos };
    
    // Optimistic update
    set({
      usuarioActual: usuarioActualizado,
      usuarios: usuarios.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u)
    });
    localStorage.setItem('auth_session', JSON.stringify(usuarioActualizado));

    // Supabase update
    try {
      const updatePayload = {
        nombre: usuarioActualizado.nombre,
        rol: usuarioActualizado.rol,
        estado: usuarioActualizado.estado,
        email: usuarioActualizado.correo
      };
      if (datos.password) {
        updatePayload.password = datos.password;
      }
      
      await supabase.from('usuarios').update(updatePayload).eq('id', usuarioActualizado.id);
    } catch (e) {
      console.error('Failed to sync to Supabase', e);
    }
  },

  // --- Funciones de Administración ---

  toggleMantenimiento: async (estado, mensaje) => {
    set({ modoMantenimiento: estado, mensajeMantenimiento: mensaje });
    await supabase.from('configuracion').upsert([{ 
      id: 'sistema', 
      datos: { modoMantenimiento: estado, mensajeMantenimiento: mensaje } 
    }]);
  },

  agregarUsuario: async (nuevoUsuario) => {
    const idTemp = Date.now().toString();
    const usuario = {
      ...nuevoUsuario,
      id: idTemp,
      estado: 'Activo',
      password: '123'
    };

    // Optimistic
    set((state) => ({ usuarios: [...state.usuarios, usuario] }));

    try {
      const { data, error } = await supabase.from('usuarios').insert([{
        email: nuevoUsuario.correo,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
        estado: 'Activo',
        permisos: nuevoUsuario.rol === 'ADMINISTRADOR' ? null : defaultPermisos
      }]).select();

      if (!error && data && data.length > 0) {
        // Update with real ID
        set((state) => ({
          usuarios: state.usuarios.map(u => u.id === idTemp ? { ...u, id: data[0].id } : u)
        }));
      }
    } catch (e) {
      console.error(e);
    }
  },

  actualizarUsuario: async (id, datos) => {
    set((state) => ({
      usuarios: state.usuarios.map(u => u.id === id ? { ...u, ...datos } : u)
    }));

    try {
      const updateData = {};
      if (datos.nombre) updateData.nombre = datos.nombre;
      if (datos.correo) updateData.email = datos.correo;
      if (datos.rol) updateData.rol = datos.rol;
      if (datos.estado) updateData.estado = datos.estado;
      if (datos.permisos !== undefined) updateData.permisos = datos.permisos;
      
      await supabase.from('usuarios').update(updateData).eq('id', id);
    } catch (e) {}
  },

  eliminarUsuario: async (id) => {
    set((state) => ({
      usuarios: state.usuarios.filter(u => u.id !== id)
    }));
    try {
      await supabase.from('usuarios').delete().eq('id', id);
    } catch (e) {}
  }
}));


