import re

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()
    
print("Found Administración Tab Button?", "Administración" in code)
print("Found Administración Content?", "Contenido de Administración" in code)
