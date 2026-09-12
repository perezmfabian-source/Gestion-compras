import React, { useState } from 'react';

const CRMProveedores = () => {
  const [proveedores, setProveedores] = useState([
    {
      id: 1,
      razonSocial: 'SUMILEC S.A.',
      nit: '891.412.809-2',
      regimen: 'Gran Contribuyente',
      actividad: 'Comercio al por mayor de materiales de construcción (4663)',
    },
    {
      id: 2,
      razonSocial: 'DISTRIBUIDORA ELÉCTRICA S.A.S.',
      nit: '900.123.456-1',
      regimen: 'Régimen Común',
      actividad: 'Otras actividades especializadas para la construcción (4390)',
    }
  ]);

  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    regimen: 'Régimen Común',
    actividad: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.razonSocial || !formData.nit) return;
    
    setProveedores([
      ...proveedores, 
      { id: Date.now(), ...formData }
    ]);
    
    setFormData({ razonSocial: '', nit: '', regimen: 'Régimen Común', actividad: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">CRM de Proveedores</h1>
          <p className="text-slate-400 mt-2">
            Gestión maestra de entidades para asignación de perfiles tributarios y ReteICA.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Formulario de Registro */}
          <div className="lg:col-span-4 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Nuevo Proveedor
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Razón Social</label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ej. Cementos Argos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">NIT</label>
                <input
                  type="text"
                  value={formData.nit}
                  onChange={(e) => setFormData({...formData, nit: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ej. 890900266-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Régimen Tributario</label>
                <select
                  value={formData.regimen}
                  onChange={(e) => setFormData({...formData, regimen: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  <option value="Gran Contribuyente Autorretenedor">Gran Contribuyente Autorretenedor</option>
                  <option value="Gran Contribuyente">Gran Contribuyente</option>
                  <option value="Régimen Común">Régimen Común (Responsable de IVA)</option>
                  <option value="Régimen Simplificado">Régimen Simplificado (Persona Natural)</option>
                  <option value="RST">Régimen Simple de Tributación (RST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Actividad Económica (CIIU)</label>
                <input
                  type="text"
                  value={formData.actividad}
                  onChange={(e) => setFormData({...formData, actividad: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Ej. 4663"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/50 transition-all"
              >
                Guardar Proveedor
              </button>
            </form>
          </div>

          {/* Tabla de Proveedores */}
          <div className="lg:col-span-8 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Base de Datos Maestra
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Razón Social / NIT</th>
                    <th className="py-4 px-6 font-semibold">Perfil Tributario</th>
                    <th className="py-4 px-6 font-semibold">Actividad (ICA)</th>
                    <th className="py-4 px-6 text-center font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {proveedores.map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{prov.razonSocial}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{prov.nit}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {prov.regimen}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {prov.actividad || 'No definida'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400">
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CRMProveedores;
