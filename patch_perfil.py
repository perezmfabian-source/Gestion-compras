import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update state
code = code.replace(
    "correo: usuarioActual?.correo || ''",
    "correo: usuarioActual?.correo || '', password: ''"
)

# Update guardarPerfil
code = code.replace(
    "await actualizarPerfil({ nombre: perfilForm.nombre, correo: perfilForm.correo });",
    "const updates = { nombre: perfilForm.nombre, correo: perfilForm.correo };\n    if (perfilForm.password) updates.password = perfilForm.password;\n    await actualizarPerfil(updates);\n    setPerfilForm({...perfilForm, password: ''});"
)

# Add password input UI
ui_old = """                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-medium">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={perfilForm.nombre}
                        onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-medium">Correo Electrónico (Usuario)</label>
                      <input 
                        type="email" 
                        value={perfilForm.correo}
                        onChange={e => setPerfilForm({...perfilForm, correo: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>"""

ui_new = """                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-medium">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={perfilForm.nombre}
                        onChange={e => setPerfilForm({...perfilForm, nombre: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2 font-medium">Correo Electrónico (Usuario)</label>
                      <input 
                        type="email" 
                        value={perfilForm.correo}
                        onChange={e => setPerfilForm({...perfilForm, correo: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-xs text-slate-400 mb-2 font-medium">Cambiar Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="Deja en blanco para no cambiarla"
                      value={perfilForm.password}
                      onChange={e => setPerfilForm({...perfilForm, password: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>"""

code = code.replace(ui_old, ui_new)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
