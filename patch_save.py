import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix guardarUsuario to include alert
guardar_usuario_old = """  const guardarUsuario = () => {
    if (!formData.nombre || !formData.correo) return;
    
    if (usuarioEditando) {
      actualizarUsuario(usuarioEditando, formData);
    } else {
      agregarUsuario(formData);
    }
    setShowModal(false);
  };"""

guardar_usuario_new = """  const guardarUsuario = () => {
    if (!formData.nombre || !formData.correo) return;
    
    if (usuarioEditando) {
      actualizarUsuario(usuarioEditando, formData);
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Usuario Actualizado', message: 'Los datos del usuario han sido actualizados exitosamente.', onConfirm: () => setDialogConfig({ isOpen: false }) });
    } else {
      agregarUsuario(formData);
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Usuario Creado', message: 'El nuevo usuario ha sido creado exitosamente.', onConfirm: () => setDialogConfig({ isOpen: false }) });
    }
    setShowModal(false);
  };"""

code = code.replace(guardar_usuario_old, guardar_usuario_new)

# Fix role values
code = code.replace('<option value="ANALISTA">ANALISTA (COMPRAS)</option>', '<option value="ANALISTA COMPRAS">ANALISTA COMPRAS</option>')
code = code.replace("rol: 'ANALISTA'", "rol: 'ANALISTA COMPRAS'")

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
