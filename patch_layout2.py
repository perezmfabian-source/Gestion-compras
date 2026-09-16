import re

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_profile = """          {/* Perfil del Usuario */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden shrink-0">
                {usuarioActual?.fotoUrl ? (
                  <img src={usuarioActual.fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  usuarioActual?.nombre?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{usuarioActual?.nombre}</p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{usuarioActual?.rol}</p>
              </div>"""

new_profile = """          {/* Perfil del Usuario */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden shrink-0">
                {usuarioActual?.fotoUrl ? (
                  <img src={usuarioActual.fotoUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  usuarioActual?.nombre?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{usuarioActual?.nombre}</p>
                <p className="text-[9px] text-slate-400 truncate uppercase tracking-wider">{usuarioActual?.rol}</p>
              </div>"""

code = code.replace(old_profile, new_profile)

old_branding = """<img src="/nexatech-logo.png" alt="Nexatech Logo" className="w-32 h-auto object-contain mb-2" />"""
new_branding = """<img src="/nexatech-logo.png" alt="Nexatech Logo" className="w-48 h-auto object-contain scale-[1.3] transform origin-center -my-1 mb-2" />"""
code = code.replace(old_branding, new_branding)

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
