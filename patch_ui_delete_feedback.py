import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add Trash2 to lucide imports
code = code.replace("import { CheckCircle, Clock } from 'lucide-react';", "import { CheckCircle, Clock, Trash2 } from 'lucide-react';")

# Add eliminarFeedback to useAuthStore hook destructuring
code = code.replace("    actualizarEstadoFeedback,\n", "    actualizarEstadoFeedback,\n    eliminarFeedback,\n")

# Add delete button logic in the map loop
old_buttons = """                        <div>
                          {fb.estado === 'CORREGIDO' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold uppercase">
                              <CheckCircle className="w-3 h-3" /> Corregido
                            </span>
                          ) : (
                            <button 
                              onClick={() => actualizarEstadoFeedback(fb.id, 'CORREGIDO')}
                              className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:scale-105"
                            >
                              <Clock className="w-3.5 h-3.5" /> Marcar Resuelto
                            </button>
                          )}
                        </div>"""

new_buttons = """                        <div className="flex items-center gap-2">
                          {fb.estado === 'CORREGIDO' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold uppercase">
                              <CheckCircle className="w-3 h-3" /> Corregido
                            </span>
                          ) : (
                            <button 
                              onClick={() => actualizarEstadoFeedback(fb.id, 'CORREGIDO')}
                              className="inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:scale-105"
                            >
                              <Clock className="w-3.5 h-3.5" /> Marcar Resuelto
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('¿Estás seguro de eliminar este feedback?')) {
                                eliminarFeedback(fb.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg transition-colors border border-slate-700"
                            title="Eliminar observación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>"""

code = code.replace(old_buttons, new_buttons)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
