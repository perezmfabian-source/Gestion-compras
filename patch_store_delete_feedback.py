import re

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'r', encoding='utf-8') as f:
    code = f.read()

old_actualizar = """    actualizarEstadoFeedback: async (id, nuevoEstado) => {
      const { error } = await supabase.from('feedback_pruebas').update({ estado: nuevoEstado }).eq('id', id);
      if (!error) {
        const { data } = await supabase.from('feedback_pruebas').select('*').order('created_at', { ascending: false });
        if (data) set({ feedbacks: data });
      }
    },"""

new_actualizar = """    actualizarEstadoFeedback: async (id, nuevoEstado) => {
      const { error } = await supabase.from('feedback_pruebas').update({ estado: nuevoEstado }).eq('id', id);
      if (!error) {
        const { data } = await supabase.from('feedback_pruebas').select('*').order('created_at', { ascending: false });
        if (data) set({ feedbacks: data });
      }
    },
    eliminarFeedback: async (id) => {
      const { error } = await supabase.from('feedback_pruebas').delete().eq('id', id);
      if (!error) {
        const { data } = await supabase.from('feedback_pruebas').select('*').order('created_at', { ascending: false });
        if (data) set({ feedbacks: data });
      }
    },"""

code = code.replace(old_actualizar, new_actualizar)

with open(r'c:\Proyectos\Gestion compras\src\store\useAuthStore.js', 'w', encoding='utf-8') as f:
    f.write(code)
