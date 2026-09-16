import re

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'r', encoding='utf-8') as f:
    code = f.read()

new_state = """  feedbacks: [],
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
"""

# Insert right before initAuth: async () => {
code = code.replace("  initAuth: async () => {", new_state + "\n  initAuth: async () => {")

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'w', encoding='utf-8') as f:
    f.write(code)
