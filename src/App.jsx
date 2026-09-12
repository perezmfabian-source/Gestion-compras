import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GeneradorOrdenCompra from './components/GeneradorOrdenCompra';
import CRMProveedores from './components/CRMProveedores';
import ConfiguracionTributaria from './components/ConfiguracionTributaria';
import CuentasPorPagar from './components/CuentasPorPagar';
import Login from './components/Login';
import GestionUsuarios from './components/GestionUsuarios';
import Almacen from './components/Almacen';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const usuarioActual = useAuthStore(state => state.usuarioActual);
  const modoMantenimiento = useAuthStore(state => state.modoMantenimiento);

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