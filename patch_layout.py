import re

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Change label to Mi Perfil
code = code.replace(
    "{ path: '/usuarios', label: 'Control de Usuario', icon: UserCog, module: 'usuarios' }",
    "{ path: '/usuarios', label: 'Mi Perfil', icon: UserCog, module: 'usuarios' }"
)

# Make it bypass permissions
old_filter = "const visibleNavItems = navItems.filter(item => tienePermiso(item.module, 'lectura'));"
new_filter = "const visibleNavItems = navItems.filter(item => item.module === 'usuarios' || tienePermiso(item.module, 'lectura'));"

code = code.replace(old_filter, new_filter)

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
