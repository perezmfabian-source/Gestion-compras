import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const usuariosIniciales = [
  { id: 1, nombre: 'ADMINISTRADOR', correo: 'admin@empresa.com', rol: 'ADMINISTRADOR', estado: 'ACTIVO', password: 'admin' },
  { id: 2, nombre: 'ANALISTA COMPRAS', correo: 'analista@empresa.com', rol: 'ANALISTA', estado: 'ACTIVO', password: '123' },
  { id: 3, nombre: 'PRESUPUESTADOR', correo: 'proyectos@empresa.com', rol: 'PRESUPUESTADOR', estado: 'ACTIVO', password: '123' }
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      usuarioActual: null,
      usuarios: usuariosIniciales,
      modoMantenimiento: false,
      mensajeMantenimiento: 'El administrador está realizando actualizaciones en la plataforma para mejorar tu experiencia. Por favor, intenta ingresar más tarde.',

      iniciarSesion: (correo, password) => {
        const { usuarios, modoMantenimiento } = get();
        const usuarioEncontrado = usuarios.find(u => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password);
        
        if (!usuarioEncontrado) {
          return { exito: false, mensaje: 'Credenciales incorrectas' };
        }

        if (usuarioEncontrado.estado !== 'ACTIVO') {
          return { exito: false, mensaje: 'Tu cuenta está inactiva' };
        }

        // Si está en mantenimiento, solo los admin pueden entrar
        if (modoMantenimiento && usuarioEncontrado.rol !== 'ADMINISTRADOR') {
          return { exito: false, mensaje: 'Mantenimiento' };
        }

        set({ usuarioActual: usuarioEncontrado });
        return { exito: true };
      },

      cerrarSesion: () => set({ usuarioActual: null }),

      actualizarPerfil: (datos) => set((state) => {
        if (!state.usuarioActual) return state;
        
        const usuarioActualizado = { ...state.usuarioActual, ...datos };
        
        return {
          usuarioActual: usuarioActualizado,
          usuarios: state.usuarios.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u)
        };
      }),

      // --- Funciones de Administración ---

      toggleMantenimiento: (estado, mensaje) => set({ 
        modoMantenimiento: estado, 
        mensajeMantenimiento: mensaje 
      }),

      agregarUsuario: (nuevoUsuario) => set((state) => ({
        usuarios: [
          ...state.usuarios, 
          { 
            ...nuevoUsuario, 
            id: Date.now(), 
            estado: 'ACTIVO',
            password: '123' // Contraseña por defecto para pruebas
          }
        ]
      })),

      actualizarUsuario: (id, datos) => set((state) => ({
        usuarios: state.usuarios.map(u => u.id === id ? { ...u, ...datos } : u)
      })),

      eliminarUsuario: (id) => set((state) => ({
        usuarios: state.usuarios.filter(u => u.id !== id)
      }))
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
