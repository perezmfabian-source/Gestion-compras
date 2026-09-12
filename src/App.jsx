import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GeneradorOrdenCompra from './components/GeneradorOrdenCompra';
import CRMProveedores from './components/CRMProveedores';
import ConfiguracionTributaria from './components/ConfiguracionTributaria';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="ordenes" element={<GeneradorOrdenCompra />} />
          <Route path="proveedores" element={<CRMProveedores />} />
          <Route path="configuracion" element={<ConfiguracionTributaria />} />
          
          {/* Ruta por defecto */}
          <Route index element={<GeneradorOrdenCompra />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;