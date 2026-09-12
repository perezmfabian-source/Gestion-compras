import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GeneradorOrdenCompra from './components/GeneradorOrdenCompra';
import CRMProveedores from './components/CRMProveedores';
import ConfiguracionTributaria from './components/ConfiguracionTributaria';
import CuentasPorPagar from './components/CuentasPorPagar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="ordenes" element={<GeneradorOrdenCompra />} />
          <Route path="proveedores" element={<CRMProveedores />} />
          <Route path="configuracion" element={<ConfiguracionTributaria />} />
          <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} />
          
          {/* Ruta por defecto */}
          <Route index element={<GeneradorOrdenCompra />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;