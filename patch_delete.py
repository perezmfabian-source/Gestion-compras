import re

with open(r'c:\Proyectos\Gestion compras\src\components\CRMProveedores.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Change permission check
code = code.replace(
    "{tienePermiso('proveedores.eliminar') && (",
    "{tienePermiso('proveedores', 'borrado') && ("
)

with open(r'c:\Proyectos\Gestion compras\src\components\CRMProveedores.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
