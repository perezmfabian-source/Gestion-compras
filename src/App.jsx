import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GeneradorOrdenCompra from './components/GeneradorOrdenCompra';
import CRMProveedores from './components/CRMProveedores';
import ConfiguracionTributaria from './components/ConfiguracionTributaria';
import CuentasPorPagar from './components/CuentasPorPagar';
import Login from './components/Login';
import GestionUsuarios from './components/GestionUsuarios';
import Almacen from './components/Almacen';
import RecepcionFacturas from './components/RecepcionFacturas';
import { useAuthStore } from './store/useAuthStore';
import { useComprasStore } from './store/useComprasStore';

function App() {
  const usuarioActual = useAuthStore(state => state.usuarioActual);
  const modoMantenimiento = useAuthStore(state => state.modoMantenimiento);
  const isAuthInitialized = useAuthStore(state => state.isInitialized);
  const isStoreInitialized = useComprasStore(state => state.isInitialized);

  useEffect(() => {
    // Restaurar sesion guardada en storage temporalmente
    useAuthStore.getState().restaurarSesion();
    
    // Cargar datos de Supabase si hay conexion
    useAuthStore.getState().initAuth();
    useComprasStore.getState().initStore();
  }, []);

  if (!isAuthInitialized || !isStoreInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p className="text-sm font-semibold tracking-widest uppercase">Conectando a Supabase...</p>
      </div>
    );
  }

  if (!usuarioActual) {
    return <Login />;
  }

  if (modoMantenimiento && usuarioActual.rol !== 'ADMINISTRADOR') {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="ordenes" element={<GeneradorOrdenCompra />} />
          <Route path="almacen" element={<Almacen />} />
          <Route path="facturas" element={<RecepcionFacturas />} />
          <Route path="proveedores" element={<CRMProveedores />} />
          <Route path="configuracion" element={<ConfiguracionTributaria />} />
          <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          
          {/* Ruta por defecto */}
          <Route index element={<Navigate to="/ordenes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;