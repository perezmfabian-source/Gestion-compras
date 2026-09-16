import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_logic = """  const handleGuardarMantenimiento = () => {
    toggleMantenimiento(!modoMantenimiento, mantenimientoTexto);
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Mantenimiento',
      message: `Modo mantenimiento ${!modoMantenimiento ? 'Activado' : 'Desactivado'} exitosamente.`,
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };"""

new_logic = """  const handleToggleEstado = () => {
    toggleMantenimiento(!modoMantenimiento, mantenimientoTexto);
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Mantenimiento',
      message: `Modo mantenimiento ${!modoMantenimiento ? 'Activado' : 'Desactivado'} exitosamente.`,
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };

  const handleGuardarMensaje = () => {
    toggleMantenimiento(modoMantenimiento, mantenimientoTexto);
    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Mantenimiento',
      message: 'Mensaje de mantenimiento actualizado exitosamente.',
      onConfirm: () => setDialogConfig({ isOpen: false })
    });
  };"""
code = code.replace(old_logic, new_logic)

old_btn_toggle = """<button 
                    onClick={handleGuardarMantenimiento}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-colors border ${"""

new_btn_toggle = """<button 
                    onClick={handleToggleEstado}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-colors border ${"""
code = code.replace(old_btn_toggle, new_btn_toggle)

old_btn_msg = """<button 
                  onClick={handleGuardarMantenimiento}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-lg transition-colors shrink-0"
                >
                  Guardar Mensaje
                </button>"""

new_btn_msg = """<button 
                  onClick={handleGuardarMensaje}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-lg transition-colors shrink-0"
                >
                  Guardar Mensaje
                </button>"""
code = code.replace(old_btn_msg, new_btn_msg)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
