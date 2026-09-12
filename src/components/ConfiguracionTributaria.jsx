import React, { useState } from 'react';

const ConfiguracionTributaria = () => {
  const [uvt, setUvt] = useState(52289);
  const [topeRetefuente, setTopeRetefuente] = useState(27);
  
  const [tarifasIca, setTarifasIca] = useState([
    { id: 1, ciudad: 'Cartagena', actividad: 'Obras Civiles', tarifa: '9.66', estado: 'Activo' },
    { id: 2, ciudad: 'Montelíbano', actividad: 'Servicios de Ingeniería', tarifa: '6.96', estado: 'Activo' },
    { id: 3, ciudad: 'Barranquilla', actividad: 'Suministros', tarifa: '10.00', estado: 'Activo' },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Motor de Configuración Tributaria
          </h1>
          <p className="text-slate-400 mt-2">
            Parametrización de variables fiscales que rigen los cálculos automatizados de las órdenes de compra.
          </p>
        </header>

        {/* Variables Nacionales (UVT) */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Variables Nacionales (Estatuto Tributario)
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-2">Valor actual UVT (COP)</label>
              <div className="flex items-center gap-3">
                <span className="text-slate-500">$</span>
                <input
                  type="number"
                  value={uvt}
                  onChange={(e) => setUvt(Number(e.target.value))}
                  className="w-full bg-transparent text-2xl font-mono font-bold text-white focus:outline-none"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Decreto expedido por la DIAN anualmente.</p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-2">Tope Base Retefuente (Compras)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={topeRetefuente}
                  onChange={(e) => setTopeRetefuente(Number(e.target.value))}
                  className="w-20 bg-transparent text-2xl font-mono font-bold text-rose-400 focus:outline-none"
                />
                <span className="text-slate-500 font-bold">UVT</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Equivale a: <span className="text-emerald-400 font-mono">${new Intl.NumberFormat('es-CO').format(uvt * topeRetefuente)}</span> COP
              </p>
            </div>
          </div>
        </section>

        {/* Matriz de Territorialidad ICA */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Matriz de Territorialidad (ReteICA)
            </h2>
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors">
              + Agregar Municipio
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Ciudad / Municipio</th>
                  <th className="py-4 px-6 font-semibold">Actividad Económica</th>
                  <th className="py-4 px-6 font-semibold text-right">Tarifa (x Mil)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {tarifasIca.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{item.ciudad}</td>
                    <td className="py-4 px-6 text-slate-400 text-xs">{item.actividad}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                        {item.tarifa}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-end">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/50 transition-all">
            Guardar Configuración
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfiguracionTributaria;
