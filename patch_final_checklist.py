with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

import re

# Insert Checklist Button
code = re.sub(
    r"(onClick\{\(\) => setActiveTab\('Administraci[ó]n'\)\}.*?</button>\s*)\}\)",
    r"\1" + r"""})}
            {esAdmin && (
              <button 
                onClick={() => setActiveTab('Checklist')}
                className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'Checklist' 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Checklist Mejoras
              </button>
            )}""",
    code,
    flags=re.DOTALL
)

# Insert Checklist Content
new_content = """          {/* Contenido de Checklist */}
          {activeTab === 'Checklist' && esAdmin && (
            <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-6 shadow-lg mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wide">
                  <CheckCircle className="w-5 h-5" /> Checklist de Observaciones
                </h2>
                <button onClick={() => cargarFeedbacks()} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shadow-sm">
                  Actualizar Lista
                </button>
              </div>

              {(!feedbacks || feedbacks.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                  <CheckCircle className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No hay observaciones pendientes.</p>
                  <p className="text-slate-500 text-sm">¡Todo marcha perfecto!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className={`p-5 rounded-xl border transition-all ${fb.estado === 'CORREGIDO' ? 'bg-emerald-900/10 border-emerald-500/20 opacity-70' : 'bg-slate-800 border-slate-600 shadow-md'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-sm text-white flex items-center gap-2">
                            {fb.usuario_nombre}
                            <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-normal">
                              {fb.usuario_email}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(fb.created_at).toLocaleString()}</p>
                        </div>
                        <div>
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
                        </div>
                      </div>
                      <p className={`text-sm mt-3 p-3 rounded-lg bg-slate-900/50 ${fb.estado === 'CORREGIDO' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {fb.mensaje}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
"""
code = re.sub(
    r"(\{\/\* Contenido de Administraci[ó]n \*\/)",
    new_content + r"\n          \1",
    code
)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

