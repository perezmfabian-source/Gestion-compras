with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

import re
# Insert the button exactly after the Administración button
code = re.sub(
    r"(<button \s*onClick=\{\(\) => setActiveTab\('Administraci[ó]n'\)\}.*?</button>\s*)\}\)",
    r"\1" + r"""})}
            {esAdmin && (
              <button 
                onClick={() => setActiveTab('Checklist')}
                className={`px-6 py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'Checklist' 
                    ? 'border-emerald-500 text-emerald-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Checklist Mejoras
              </button>
            )}""",
    code,
    flags=re.DOTALL
)

with open(r'c:\Proyectos\Gestion compras\src\components\GestionUsuarios.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

