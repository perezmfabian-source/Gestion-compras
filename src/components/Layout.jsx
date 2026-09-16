import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Users, Settings, Building2, Wallet, UserCog, Package, FileText, MessageSquare, X, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Layout = () => {
  const usuarioActual = useAuthStore(state => state.usuarioActual);
  const cerrarSesion = useAuthStore(state => state.cerrarSesion);

  const navItems = [
    { path: '/ordenes', label: 'Nueva Orden', icon: ShoppingCart, module: 'ordenes' },
    { path: '/almacen', label: 'Almacén (Recepción)', icon: Package, module: 'almacen' },
    { path: '/facturas', label: 'Causación de Facturas', icon: FileText, module: 'facturas' },
    { path: '/cuentas-por-pagar', label: 'Cuentas por Pagar', icon: Wallet, module: 'cuentas' },
    { path: '/proveedores', label: 'CRM Proveedores', icon: Users, module: 'proveedores' },
    { path: '/configuracion', label: 'Config. Tributaria', icon: Settings, module: 'configuracion' },
    { path: '/usuarios', label: 'Mi Perfil', icon: UserCog, module: 'usuarios' }
  ];

  const tienePermiso = useAuthStore(state => state.tienePermiso);
  const visibleNavItems = navItems.filter(item => item.module === 'usuarios' || tienePermiso(item.module, 'lectura'));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Corporativo */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/presupro-logo.png" alt="PresuPro Logo" className="w-14 h-14 object-contain rounded-xl shadow-lg" />
            <h1 className="text-3xl font-bold tracking-tight">
              PresuPro
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 uppercase tracking-widest font-bold">Módulo de Compras</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Perfil del Usuario */}
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
            </div>
          </div>
          <button 
            onClick={cerrarSesion}
            className="w-full flex justify-center py-2 px-4 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Branding NEXATECH */}
        <div className="p-4 border-t border-slate-800 text-center">
          <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
            <img src="/nexatech-logo.png?v=3" alt="Nexatech Logo" className="w-24 h-auto object-contain mx-auto mb-2" />
            <p className="text-slate-400 text-[10px] leading-tight mt-1">
              Producto digital desarrollado<br />
              por <span className="text-slate-300 font-bold">Nexatech S.A.S.</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Área de Contenido Principal (Aquí carga la orden de compra) */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0">
          <Outlet />
        </div>
      </main>
    
      <FeedbackButton />
    </div>
  );
};

export default Layout;

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
