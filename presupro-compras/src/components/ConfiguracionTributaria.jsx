import React, { useState } from 'react';
import { Calculator, MapPin, Save, AlertCircle, Plus, Trash2, Landmark } from 'lucide-react';

export const ConfiguracionTributaria = () => {
  // ================= ESTADOS SIMULADOS =================
  const [uvtConfig, setUvtConfig] = useState({
    anioFiscal: 2026,
    valorUVT: 52289,
    umbralCompras: 27,
  });

  const [matrizICA, setMatrizICA] = useState([
    { id: 1, municipio: '11001 - Bogotá D.C.', tarifa: 9.66 },
    { id: 2, municipio: '13001 - Cartagena de Indias', tarifa: 7.00 },
    { id: 3, municipio: '05001 - Medellín', tarifa: 10.00 },
  ]);

  const [nuevoMunicipio, setNuevoMunicipio] = useState({ municipio: '', tarifa: '' });
  const [guardadoExitosa, setGuardadoExitosa] = useState(false);

  // ================= HANDLERS =================
  const handleUvtChange = (e) => {
    setUvtConfig({ ...uvtConfig, [e.target.name]: Number(e.target.value) });
  };

  const handleAddMunicipio = (e) => {
    e.preventDefault();
    if (!nuevoMunicipio.municipio || !nuevoMunicipio.tarifa) return;
    
    setMatrizICA([
      ...matrizICA, 
      { id: Date.now(), municipio: nuevoMunicipio.municipio, tarifa: Number(nuevoMunicipio.tarifa) }
    ]);
    setNuevoMunicipio({ municipio: '', tarifa: '' });
  };

  const handleRemoveMunicipio = (id) => {
    setMatrizICA(matrizICA.filter((item) => item.id !== id));
  };

  const handleGuardarConfiguracion = () => {
    // Aquí se enviaría el payload al backend
    console.log('Guardando configuración...', { uvtConfig, matrizICA });
    setGuardadoExitosa(true);
    setTimeout(() => setGuardadoExitosa(false), 3000);
  };

  // Cálculo derivado en tiempo real
  const baseRetencionPesos = uvtConfig.valorUVT * uvtConfig.umbralCompras;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 lg:p-8 font-sans">
      
      {/* Header del Módulo */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
              <Landmark className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Configuración Tributaria</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            Parámetros macroeconómicos y territoriales para el Motor de Retenciones.
          </p>
        </div>
        
        <button 
          onClick={handleGuardarConfiguracion}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20 shrink-0"
        >
          <Save className="w-4 h-4" />
          Guardar Parámetros
        </button>
      </div>

      {guardadoExitosa && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Configuración actualizada correctamente. Los nuevos valores aplicarán para todas las Órdenes de Compra generadas desde este momento.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ================= CARD 1: MACROECONOMÍA Y UVT ================= */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Bases Nacionales (UVT)</h2>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Año Fiscal</label>
                <input
                  type="number"
                  name="anioFiscal"
                  value={uvtConfig.anioFiscal}
                  onChange={handleUvtChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Valor UVT (COP) <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    name="valorUVT"
                    value={uvtConfig.valorUVT}
                    onChange={handleUvtChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Umbral Base para Compras (Cant. UVT)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  name="umbralCompras"
                  value={uvtConfig.umbralCompras}
                  onChange={handleUvtChange}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                />
                <span className="text-slate-500 text-sm font-medium">UVTs</span>
              </div>
            </div>

            {/* Resultado Reactivo */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Tope Mínimo ReteFuente/ReteICA</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Calculado en tiempo real</p>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-400">
                ${baseRetencionPesos.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </section>

        {/* ================= CARD 2: TERRITORIALIDAD (ICA) ================= */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Matriz Territorial de ReteICA</h2>
          </div>

          <div className="flex flex-col flex-1 h-full">
            {/* Formulario Agregar Ciudad */}
            <form onSubmit={handleAddMunicipio} className="p-5 border-b border-slate-700 bg-slate-800/30 flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ej. 08001 - Barranquilla"
                  value={nuevoMunicipio.municipio}
                  onChange={(e) => setNuevoMunicipio({...nuevoMunicipio, municipio: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="w-24 relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="9.66"
                  value={nuevoMunicipio.tarifa}
                  onChange={(e) => setNuevoMunicipio({...nuevoMunicipio, tarifa: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-7 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">‰</span>
              </div>
              <button 
                type="submit"
                disabled={!nuevoMunicipio.municipio || !nuevoMunicipio.tarifa}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {/* Tabla de Tarifas */}
            <div className="overflow-x-auto overflow-y-auto max-h-[250px]">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-900 text-slate-400 border-b border-slate-700 z-10">
                  <tr>
                    <th className="px-5 py-3 font-medium">Jurisdicción (Municipio)</th>
                    <th className="px-5 py-3 font-medium text-right">Tarifa (Por Mil)</th>
                    <th className="px-5 py-3 font-medium text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {matrizICA.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-slate-500 text-xs">
                        No hay tarifas configuradas. Agrega una jurisdicción.
                      </td>
                    </tr>
                  ) : (
                    matrizICA.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3 text-slate-200">{item.municipio}</td>
                        <td className="px-5 py-3 text-right font-mono text-indigo-300 font-medium">
                          {item.tarifa.toFixed(2)} ‰
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button 
                            onClick={() => handleRemoveMunicipio(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 mt-auto bg-slate-800/80 border-t border-slate-700 text-xs text-slate-400">
              <strong>Nota:</strong> Estas tarifas territoriales se inyectan automáticamente en la orden de compra dependiendo del Centro de Costo u Obra seleccionada.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ConfiguracionTributaria;
