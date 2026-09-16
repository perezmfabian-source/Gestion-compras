import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add to imports
code = code.replace("import { useAuthStore } from '../store/useAuthStore';", "import { useAuthStore } from '../store/useAuthStore';\nimport { CheckCircle, Clock } from 'lucide-react';")
code = code.replace("    toggleMantenimiento,\n", "    toggleMantenimiento,\n    feedbacks,\n    cargarFeedbacks,\n    actualizarEstadoFeedback,\n")

# Load feedbacks on mount
use_effect = """  useEffect(() => {
    cargarFeedbacks();
  }, []);"""

code = code.replace("  const [mantenimientoTexto, setMantenimientoTexto] = useState(mensajeMantenimiento);", "  const [mantenimientoTexto, setMantenimientoTexto] = useState(mensajeMantenimiento);\n\n" + use_effect)

# Add Checklist tab to esAdmin condition
old_tabs = """          <div className="flex bg-slate-800/50 p-1 rounded-xl w-max mb-6">
            {['Administración', 'Mis Credenciales'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}"""

new_tabs = """          <div className="flex bg-slate-800/50 p-1 rounded-xl w-max mb-6">
            {['Administración', 'Checklist Mejoras', 'Mis Credenciales'].filter(tab => tab !== 'Administración' && tab !== 'Checklist Mejoras' ? true : esAdmin).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}"""

code = code.replace(old_tabs, new_tabs)

# Add Checklist tab content
new_tab_content = """          {/* Checklist de Mejoras */}
          {activeTab === 'Checklist Mejoras' && esAdmin && (
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wide">
                  ✓ Checklist de Observaciones de Usuarios
                </h2>
                <button onClick={() => cargarFeedbacks()} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors">
                  Actualizar Lista
                </button>
              </div>

              {(!feedbacks || feedbacks.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                  <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-slate-500">No hay observaciones pendientes. ¡Todo marcha perfecto!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className={`p-4 rounded-xl border ${fb.estado === 'CORREGIDO' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-sm text-white">{fb.usuario_nombre}</p>
                          <p className="text-[10px] text-slate-400">{new Date(fb.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          {fb.estado === 'CORREGIDO' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold uppercase">
                              <CheckCircle className="w-3 h-3" /> Corregido
                            </span>
                          ) : (
                            <button 
                              onClick={() => actualizarEstadoFeedback(fb.id, 'CORREGIDO')}
                              className="inline-flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-lg"
                            >
                              <Clock className="w-3 h-3" /> Marcar Resuelto
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mt-3 ${fb.estado === 'CORREGIDO' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {fb.mensaje}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}"""

old_admin = """          {activeTab === 'Administración' && esAdmin && ("""
code = code.replace(old_admin, new_tab_content + "\n\n" + old_admin)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
