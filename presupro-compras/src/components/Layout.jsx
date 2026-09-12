import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Users, Settings, Building, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/ordenes', label: 'Nueva Orden', icon: ShoppingCart, badge: 'Activo' },
  { path: '/proveedores', label: 'CRM Proveedores', icon: Users, badge: null },
  { path: '/configuracion', label: 'Configuración Tributaria', icon: Settings, badge: null },
];

export const Layout = () => {
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased">
      <aside className="w-64 fixed inset-y-0 left-0 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">PresuPro</h1>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mt-1">Módulo Compras</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Gestión de Abastecimiento</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">Bustillo Ing. SAS</p>
              <span className="text-[10px] text-slate-400 block truncate">Régimen Común • 2026</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 pl-64 min-h-screen flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
