import re

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Update Profile padding
old_profile = """          {/* Perfil del Usuario */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4">"""

new_profile = """          {/* Perfil del Usuario */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3">"""
code = code.replace(old_profile, new_profile)


# Update Nexatech Branding
old_branding = """          {/* Branding NEXATECH */}
          <div className="p-4 border-t border-slate-800 text-center">
            <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
              <img src="/nexatech-logo.png" alt="Nexatech Logo" className="h-8 object-contain mb-2" />
              <p className="text-slate-400 text-[10px] leading-tight mt-1">
                Producto digital desarrollado<br />
                por <span className="text-slate-300 font-bold">Nexatech S.A.S.</span>
              </p>
            </div>
          </div>"""

new_branding = """          {/* Branding NEXATECH */}
          <div className="py-3 px-2 border-t border-slate-800 text-center bg-slate-900">
            <div className="flex flex-col items-center justify-center hover:opacity-100 transition-opacity">
              <img src="/nexatech-logo.png" alt="Nexatech Logo" className="h-12 w-auto object-contain mb-1.5" />
              <p className="text-slate-400 text-[11px] leading-tight">
                Producto digital desarrollado<br />
                por <span className="text-slate-300 font-bold">Nexatech S.A.S.</span>
              </p>
            </div>
          </div>"""

code = code.replace(old_branding, new_branding)

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
