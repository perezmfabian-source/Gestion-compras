import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace window.confirm with setDialogConfig
old_btn = """                          <button
                            onClick={() => {
                              if (window.confirm('¿Estás seguro de eliminar este feedback?')) {
                                eliminarFeedback(fb.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg transition-colors border border-slate-700"
                            title="Eliminar observación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>"""

new_btn = """                          <button
                            onClick={() => {
                              setDialogConfig({
                                isOpen: true,
                                type: 'confirm',
                                title: 'Eliminar Observación',
                                message: '¿Estás seguro de eliminar esta observación?',
                                onConfirm: () => {
                                  eliminarFeedback(fb.id);
                                  setDialogConfig({ isOpen: false });
                                }
                              });
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 rounded-lg transition-colors border border-slate-700"
                            title="Eliminar observación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>"""

code = code.replace(old_btn, new_btn)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
