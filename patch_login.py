import re

with open(r'c:\Proyectos\Gestion compras\src\components\Login.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Buscamos el bloque de credenciales de prueba y lo removemos.
# Empieza con <div className="relative mt-8"> y termina después de los dos divs de credenciales.
pattern = r'\s*<div className="relative mt-8">.*?</p>\s*</div>\s*</div>\s*</div>'

# Utilizamos re.sub con re.DOTALL para que coincida en múltiples líneas
code = re.sub(pattern, '', code, flags=re.DOTALL)

with open(r'c:\Proyectos\Gestion compras\src\components\Login.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
