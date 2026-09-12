import React, { useState, useRef } from 'react';
import { useComprasStore } from '../store/useComprasStore';

const CRMProveedores = () => {
  const proveedores = useComprasStore(state => state.proveedores) || [];
  const guardarProveedor = useComprasStore(state => state.guardarProveedor);
  const eliminarProveedor = useComprasStore(state => state.eliminarProveedor);

  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    perfilTributario: 'Regimen Comun',
    actividad: '',
    formaPago: 'Contado',
    documentos: [] // { nombre: '', base64: '' }
  });

  const [modoEdicion, setModoEdicion] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.razonSocial || !formData.nit) return;
    
    // Guardar o Actualizar
    guardarProveedor(formData);
    
    // Resetear form
    setFormData({ razonSocial: '', nit: '', perfilTributario: 'Regimen Comun', actividad: '', formaPago: 'Contado', documentos: [] });
    setModoEdicion(false);
  };

  const cargarParaEdicion = (prov) => {
    // Asegurar retrocompatibilidad con los datos viejos
    const formAEditar = {
      ...prov,
      perfilTributario: prov.perfilTributario || prov.regimen || 'Regimen Comun'
    };
    setFormData(formAEditar);
    setModoEdicion(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Validar tamaño aprox < 2MB para no matar localStorage
      if(file.size > 2 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 2MB permitidos para demo local.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          documentos: [...(prev.documentos || []), { nombre: file.name, base64: ev.target.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
    
    // Clear input
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const eliminarDocumento = (index) => {
    const nuevos = [...(formData.documentos || [])];
    nuevos.splice(index, 1);
    setFormData({...formData, documentos: nuevos});
  };

  const descargarDocumento = (doc) => {
    const a = document.createElement('a');
    a.href = doc.base64;
    a.download = doc.nombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
            <h2 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${modoEdicion ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                {modoEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </div>
              {modoEdicion && (
                <button 
                  onClick={() => {
                    setFormData({ razonSocial: '', nit: '', perfilTributario: 'Regimen Comun', actividad: '', formaPago: 'Contado', documentos: [] });
                    setModoEdicion(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              )}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Razón Social</label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  placeholder="Ej. Cementos Argos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">NIT</label>
                <input
                  type="text"
                  value={formData.nit}
                  disabled={modoEdicion}
                  onChange={(e) => setFormData({...formData, nit: e.target.value})}
                  className={`w-full px-4 py-2 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${modoEdicion ? 'bg-slate-800 opacity-70' : 'bg-slate-900'}`}
                  placeholder="Ej. 890900266-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Perfil Tributario</label>
                <select
                  value={formData.perfilTributario}
                  onChange={(e) => setFormData({...formData, perfilTributario: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="Autorretenedor">Gran Contribuyente Autorretenedor</option>
                  <option value="Gran Contribuyente">Gran Contribuyente</option>
                  <option value="Regimen Comun">Régimen Común (Responsable de IVA)</option>
                  <option value="Regimen Simplificado">Régimen Simplificado (Persona Natural)</option>
                  <option value="Regimen Simple">Régimen Simple de Tributación (RST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Condición de Pago</label>
                <select
                  value={formData.formaPago}
                  onChange={(e) => setFormData({...formData, formaPago: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                >
                  <option value="Contado">Contado</option>
                  <option value="Crédito 15 días">Crédito 15 días</option>
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Crédito 60 días">Crédito 60 días</option>
                </select>
              </div>

              {/* Adjuntos */}
              <div className="pt-2 border-t border-slate-700 mt-4">
                <label className="block text-sm font-bold text-white mb-2">Documentos Adjuntos</label>
                
                {/* Lista de adjuntos */}
                {formData.documentos && formData.documentos.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {formData.documentos.map((doc, idx) => (
                      <li key={idx} className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded border border-slate-700">
                        <span className="truncate max-w-[200px] text-slate-300" title={doc.nombre}>📄 {doc.nombre}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button type="button" onClick={() => descargarDocumento(doc)} className="text-indigo-400 hover:text-indigo-300" title="Descargar">⬇️</button>
                          <button type="button" onClick={() => eliminarDocumento(idx)} className="text-rose-400 hover:text-rose-300" title="Eliminar">❌</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-6 h-6 mb-2 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                          <p className="text-xs text-slate-400"><span className="font-semibold">Subir RUT, Cámara, Bancario</span></p>
                          <p className="text-[10px] text-slate-500">PDF (Max 2MB)</p>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" accept=".pdf" multiple onChange={handleFileUpload} ref={fileInputRef} />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full mt-6 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all ${modoEdicion ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'}`}
              >
                {modoEdicion ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
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
                Base de Datos Maestra ({proveedores.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Razón Social / NIT</th>
                    <th className="py-4 px-6 font-semibold">Perfil / Pago</th>
                    <th className="py-4 px-6 font-semibold text-center">Documentos</th>
                    <th className="py-4 px-6 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {proveedores.map((prov) => (
                    <tr key={prov.nit} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{prov.razonSocial}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{prov.nit}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                          {prov.regimen || prov.perfilTributario}
                        </span>
                        <div className="text-[10px] uppercase font-bold text-slate-500">{prov.formaPago || 'Contado'}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {prov.documentos && prov.documentos.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-semibold" title={prov.documentos.map(d=>d.nombre).join(', ')}>
                            📄 {prov.documentos.length} Docs
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">Sin adjuntos</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => cargarParaEdicion(prov)} className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded transition-colors" title="Editar">
                            ✏️
                          </button>
                          <button onClick={() => { if(window.confirm('¿Borrar este proveedor?')) eliminarProveedor(prov.nit) }} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors" title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {proveedores.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-500">
                        No hay proveedores registrados.
                      </td>
                    </tr>
                  )}
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
