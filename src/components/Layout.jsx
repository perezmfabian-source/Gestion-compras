import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Users, Settings, Building2, Wallet } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { path: '/ordenes', label: 'Nueva Orden', icon: ShoppingCart },
    { path: '/cuentas-por-pagar', label: 'Cuentas por Pagar', icon: Wallet },
    { path: '/proveedores', label: 'CRM Proveedores', icon: Users },
    { path: '/configuracion', label: 'Config. Tributaria', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Corporativo */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            PresuPro
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Módulo de Compras</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
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