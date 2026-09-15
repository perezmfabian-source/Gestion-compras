import re

with open(r'c:\Proyectos\Gestion compras\src\components\GeneradorOrdenCompra.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Change permission check
code = code.replace(
    "{tienePermiso('ordenes.eliminar') && (",
    "{tienePermiso('ordenes', 'borrado') && ("
)

with open(r'c:\Proyectos\Gestion compras\src\components\GeneradorOrdenCompra.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
