import re

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_branding = """<img src="/nexatech-logo.png" alt="Nexatech Logo" className="w-48 h-auto object-contain scale-[1.3] transform origin-center -my-1 mb-2" />"""
new_branding = """<img src="/nexatech-logo.png?v=2" alt="Nexatech Logo" className="h-10 w-auto object-contain mb-2" />"""

code = code.replace(old_branding, new_branding)

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
