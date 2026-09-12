import React, { useState } from 'react';
import { Building2, Search, Plus, MoreVertical, Briefcase, FileSignature, CheckCircle2 } from 'lucide-react';

const MOCK_PROVEEDORES = [
  { id: 1, razonSocial: 'CEMEX COLOMBIA S.A.', nit: '860000210-3', regimen: 'Gran Contribuyente', actividad: '2394 - Fabricación de cemento', estado: 'Activo' },
  { id: 2, razonSocial: 'DISTRIBUIDORA HIERROS Y ACEROS SAS', nit: '900543210-8', regimen: 'Régimen Común', actividad: '4663 - Comercio al por mayor', estado: 'Activo' },
  { id: 3, razonSocial: 'SERVICIOS TÉCNICOS & GEOTECNIA RST', nit: '901234567-1', regimen: 'Régimen Simple', actividad: '7110 - Actividades de ingeniería', estado: 'En Revisión' }
];

export const CRMProveedores = () => {
  const [formData, setFormData] = useState({ razonSocial: '', nit: '', regimen: '', actividad: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Proveedor registrado exitosamente (Simulación)');
    setFormData({ razonSocial: '', nit: '', regimen: '', actividad: '' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6 lg:p-8 font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM de Proveedores</h1>
        </div>
        <p className="text-slate-400 text-sm ml-12">Gestión de terceros, fichas fiscales y parametrización tributaria.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-base font-semibold text-white flex items-center gap-2"><FileSignature className="w-4 h-4 text-indigo-400" /> Nuevo Proveedor</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Razón Social <span className="text-rose-400">*</span></label>
                <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">NIT <span className="text-rose-400">*</span></label>
                <input type="text" name="nit" value={formData.nit} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Régimen Tributario <span className="text-rose-400">*</span></label>
                <select name="regimen" value={formData.regimen} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required>
                  <option value="" disabled>Seleccione un régimen...</option>
                  <option value="Gran Contribuyente">Gran Contribuyente</option>
                  <option value="Régimen Común">Régimen Común</option>
                  <option value="Régimen Simple">Régimen Simple (RST)</option>
                  <option value="No Responsable">No Responsable</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Actividad Económica (CIIU) <span className="text-rose-400">*</span></label>
                <input type="text" name="actividad" value={formData.actividad} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" required />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20">
                  <Plus className="w-4 h-4" /> Registrar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-8">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-full">
            <div className="p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-400" /> Directorio de Proveedores</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Buscar por NIT o Empresa..." className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-400">
                    <th className="px-5 py-3.5 font-medium">Razón Social</th>
                    <th className="px-5 py-3.5 font-medium">NIT</th>
                    <th className="px-5 py-3.5 font-medium">Perfil Tributario</th>
                    <th className="px-5 py-3.5 font-medium">Actividad</th>
                    <th className="px-5 py-3.5 font-medium text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {MOCK_PROVEEDORES.map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-700/30">
                      <td className="px-5 py-4 text-slate-200">{prov.razonSocial}</td>
                      <td className="px-5 py-4 font-mono text-slate-400">{prov.nit}</td>
                      <td className="px-5 py-4"><span className="px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs">{prov.regimen}</span></td>
                      <td className="px-5 py-4 text-slate-400 text-xs">{prov.actividad}</td>
                      <td className="px-5 py-4 text-center text-emerald-400 text-xs">{prov.estado}</td>
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
