import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GeneradorOrdenCompra from './components/GeneradorOrdenCompra'; // <-- SIN LLAVES

// Componente temporal para las rutas en construcción
const EnConstruccion = ({ modulo }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center mt-10">
    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-2xl font-bold text-slate-700 mb-2">Módulo: {modulo}</h2>
    <p className="text-slate-500">Este módulo se encuentra en fase de desarrollo.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="ordenes" element={<GeneradorOrdenCompra />} />
          <Route path="proveedores" element={<EnConstruccion modulo="CRM de Proveedores" />} />
          <Route path="configuracion" element={<EnConstruccion modulo="Configuración Tributaria" />} />
          
          {/* Ruta por defecto */}
          <Route index element={<GeneradorOrdenCompra />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;