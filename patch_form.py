import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix abrirModalEditar to map ANALISTA to ANALISTA COMPRAS
abrir_modal_old = """  const abrirModalEditar = (u) => {
    setUsuarioEditando(u.id);
    setFormData({ nombre: u.nombre, correo: u.correo, rol: u.rol });
    setShowModal(true);
  };"""

abrir_modal_new = """  const abrirModalEditar = (u) => {
    setUsuarioEditando(u.id);
    let mappedRol = u.rol;
    if (mappedRol === 'ANALISTA') mappedRol = 'ANALISTA COMPRAS';
    setFormData({ nombre: u.nombre, correo: u.correo, rol: mappedRol });
    setShowModal(true);
  };"""

code = code.replace(abrir_modal_old, abrir_modal_new)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
