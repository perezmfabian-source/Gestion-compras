import re

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add imports for modal and icons
code = code.replace("import { Outlet, NavLink } from 'react-router-dom';", "import { Outlet, NavLink } from 'react-router-dom';\nimport { useState } from 'react';\nimport { MessageSquare, X, Send } from 'lucide-react';")

# Add state and UI
old_main = """      {/* ?rea de Contenido Principal (Aqu carga la orden de compra) */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;"""

new_main = """      {/* Área de Contenido Principal */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0">
          <Outlet />
        </div>
      </main>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  );
};

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const enviarFeedback = useAuthStore(state => state.enviarFeedback);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setIsSubmitting(true);
    const ok = await enviarFeedback(mensaje);
    setIsSubmitting(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setMensaje('');
      }, 2000);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-rose-500 text-white p-4 rounded-full shadow-2xl hover:bg-rose-600 hover:scale-110 transition-all z-50 group flex items-center gap-2"
        title="Reportar problema o sugerencia"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm">
          Feedback
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-rose-400" />
                Buzón de Sugerencias
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                  <h4 className="text-lg font-bold text-slate-800">¡Gracias por tu aporte!</h4>
                  <p className="text-slate-500 text-sm mt-2">El administrador revisará tu observación pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <p className="text-sm text-slate-600 mb-4">
                    ¿Encontraste algún error o tienes una idea para mejorar el sistema? ¡Escríbela aquí!
                  </p>
                  <textarea 
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none mb-4"
                    placeholder="Describe el problema o sugerencia..."
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !mensaje.trim()}
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {isSubmitting ? 'Enviando...' : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Observación
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;"""

code = code.replace(old_main, new_main)

# Also fix the Nexatech logo size since it failed earlier
old_logo = """<img src="/nexatech-logo.png" alt="Nexatech Logo" className="h-8 object-contain mb-2" />"""
new_logo = """<img src="/nexatech-logo.png?v=3" alt="Nexatech Logo" className="w-32 h-auto object-contain mx-auto mb-2" />"""
code = code.replace(old_logo, new_logo)

old_prof_size = """<div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg overflow-hidden">"""
new_prof_size = """<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-lg overflow-hidden shrink-0">"""
code = code.replace(old_prof_size, new_prof_size)

old_prof_name = """<p className="text-sm font-bold text-white truncate">{usuarioActual?.nombre}</p>"""
new_prof_name = """<p className="text-xs font-bold text-white truncate">{usuarioActual?.nombre}</p>"""
code = code.replace(old_prof_name, new_prof_name)

old_prof_rol = """<p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">{usuarioActual?.rol}</p>"""
new_prof_rol = """<p className="text-[9px] text-slate-400 truncate uppercase tracking-wider">{usuarioActual?.rol}</p>"""
code = code.replace(old_prof_rol, new_prof_rol)

old_prof_gap = """<div className="flex items-center gap-3 mb-4">"""
new_prof_gap = """<div className="flex items-center gap-2 mb-3">"""
code = code.replace(old_prof_gap, new_prof_gap)

old_prof_pad = """<div className="p-4 border-t border-slate-800 bg-slate-900/50">"""
new_prof_pad = """<div className="p-3 border-t border-slate-800 bg-slate-900/50">"""
code = code.replace(old_prof_pad, new_prof_pad)

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
