import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GeneradorOrdenCompra } from './components/GeneradorOrdenCompra';
import { CRMProveedores } from './components/CRMProveedores';
import { ConfiguracionTributaria } from './components/ConfiguracionTributaria';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/ordenes" replace />} />
          <Route path="ordenes" element={<GeneradorOrdenCompra />} />
          <Route path="proveedores" element={<CRMProveedores />} />
          <Route path="configuracion" element={<ConfiguracionTributaria />} />
          <Route path="*" element={<Navigate to="/ordenes" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
