import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Users, Settings, Building2, Wallet, UserCog, Package, FileText } from 'lucide-react';
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
            <img src="/nexatech-logo.png?v=3" alt="Nexatech Logo" className="w-32 h-auto object-contain mx-auto mb-2" />
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
    </div>
  );
};

export default Layout;