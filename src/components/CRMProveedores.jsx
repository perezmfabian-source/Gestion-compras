import React, { useState, useRef, useMemo } from 'react';
import { useComprasStore } from '../store/useComprasStore';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Phone, MapPin, Building2, UserCircle, UploadCloud, X, FileText, Download } from 'lucide-react';
import Dialog from './Dialog';

const CRMProveedores = () => {
  const tienePermiso = useAuthStore(state => state.tienePermiso);
  const proveedores = useComprasStore(state => state.proveedores) || [];
  const configTributaria = useComprasStore(state => state.configTributaria) || { tarifasIca: [] };
  const guardarProveedor = useComprasStore(state => state.guardarProveedor);
  const eliminarProveedor = useComprasStore(state => state.eliminarProveedor);
  const tarifasIca = configTributaria?.tarifasIca || [];

  const fileInputRef = useRef(null);
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  
  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    celular: '',
    vendedor: '',
    perfilTributario: 'Regimen Comun',
    actividad: '',
    formaPago: 'Contado',
    documentos: [] // { nombre: '', base64: '' }
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modalDocs, setModalDocs] = useState(null); // Para ver los documentos
  const [proveedorABorrar, setProveedorABorrar] = useState(null); // Para modal de borrado

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.razonSocial || !formData.nit) return;
    
    // Guardar o Actualizar
    guardarProveedor(formData);
    
    // Resetear form
    setFormData({ 
      razonSocial: '', nit: '', direccion: '', ciudad: '', telefono: '', celular: '', vendedor: '', 
      perfilTributario: 'Regimen Comun', actividad: '', formaPago: 'Contado', documentos: [] 
    });
    setModoEdicion(false);
    setMostrarForm(false);
  };

  const cargarParaEdicion = (prov) => {
    // Asegurar retrocompatibilidad con los datos viejos
    const formAEditar = {
      ...prov,
      perfilTributario: prov.perfilTributario || prov.regimen || 'Regimen Comun'
    };
    setFormData(formAEditar);
    setModoEdicion(true);
    setMostrarForm(true);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Validar tamaño aprox < 2MB para no matar localStorage
      if(file.size > 2 * 1024 * 1024) {
        setDialogConfig({
          isOpen: true,
          type: 'alert',
          title: 'Archivo muy grande',
          message: `El archivo ${file.name} es demasiado grande. Máximo 2MB permitidos para demo local.`,
          onConfirm: () => setDialogConfig({ isOpen: false })
        });
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
        
        <header className="border-b border-slate-700 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">CRM de Proveedores</h1>
            <p className="text-slate-400 mt-2">
              Gestión maestra de entidades para asignación de perfiles tributarios y ReteICA.
            </p>
          </div>
          <button 
            onClick={() => {
              setFormData({ razonSocial: '', nit: '', email: '', direccion: '', ciudad: '', telefono: '', celular: '', vendedor: '', perfilTributario: 'Regimen Comun', actividad: '', formaPago: 'Contado', documentos: [] });
              setModoEdicion(false);
              setMostrarForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-900/50 transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Nuevo Proveedor
          </button>
        </header>

        <div className="flex flex-col gap-8">
          
          {/* Formulario de Registro (Modal) */}
          {mostrarForm && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-600 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${modoEdicion ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                  {modoEdicion ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <button 
                  onClick={() => {
                    setFormData({ razonSocial: '', nit: '', email: '', direccion: '', ciudad: '', telefono: '', celular: '', vendedor: '', perfilTributario: 'Regimen Comun', actividad: '', formaPago: 'Contado', documentos: [] });
                    setModoEdicion(false);
                    setMostrarForm(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

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
                
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-slate-400 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Ej. ventas@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion || ''}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Ej. Calle 123 #45-67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ciudad</label>
                  <input
                    type="text"
                    list="ciudades-list"
                    value={formData.ciudad || ''}
                    onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Ej. Bogotá"
                  />
                  <datalist id="ciudades-list">
                    {[...new Set(configTributaria.tarifasIca?.map(t => t.ciudad))].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Teléfono Fijo</label>
                  <input
                    type="text"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Ej. 601 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Celular</label>
                  <input
                    type="text"
                    value={formData.celular || ''}
                    onChange={(e) => setFormData({...formData, celular: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="Ej. 300 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Vendedor / Contacto</label>
                <input
                  type="text"
                  value={formData.vendedor || ''}
                  onChange={(e) => setFormData({...formData, vendedor: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-slate-400 mb-1">Actividad (ReteICA)</label>
                  <select
                    value={formData.actividad || ''}
                    onChange={(e) => setFormData({...formData, actividad: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  >
                    <option value="">-- Seleccionar --</option>
                    {configTributaria.tarifasIca
                      ?.filter(t => !formData.ciudad || t.ciudad.toUpperCase() === formData.ciudad.toUpperCase())
                      .map((t) => (
                        <option key={t.id} value={t.actividad}>
                          {t.actividad} ({t.tarifa} x Mil)
                        </option>
                      ))}
                  </select>
                </div>
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

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ razonSocial: '', nit: '', direccion: '', ciudad: '', telefono: '', celular: '', vendedor: '', perfilTributario: 'Regimen Comun', actividad: '', formaPago: 'Contado', documentos: [] });
                    setModoEdicion(false);
                    setMostrarForm(false);
                  }}
                  className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`w-2/3 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all ${modoEdicion ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'}`}
                >
                  {modoEdicion ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
        )}

          {/* Tabla de Proveedores */}
          <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
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
                    <th className="py-4 px-6 font-semibold">Ubicación y Contacto</th>
                    <th className="py-4 px-6 font-semibold">Perfil / Pago</th>
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
                        <div className="text-xs text-slate-300">
                          {prov.ciudad ? <span className="font-bold text-emerald-400">{prov.ciudad}</span> : <span className="text-slate-600 italic">Sin ciudad</span>}
                          {prov.direccion && <span className="block mt-0.5">{prov.direccion}</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {prov.vendedor && <span className="block font-semibold text-slate-300">👤 {prov.vendedor}</span>}
                          {prov.telefono && <span>📞 {prov.telefono}</span>}
                          {prov.celular && <span className="ml-2">📱 {prov.celular}</span>}
                          {prov.email && <span className="block mt-0.5 text-indigo-400">✉️ {prov.email}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                          {prov.regimen || prov.perfilTributario}
                        </span>
                        <div className="text-[10px] uppercase font-bold text-slate-500">{prov.formaPago || 'Contado'}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col gap-2 items-center justify-center">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => cargarParaEdicion(prov)} className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded transition-colors" title="Editar">
                                ✏️
                              </button>
                              {tienePermiso('proveedores.eliminar') && (
                                <button onClick={() => setProveedorABorrar(prov)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors" title="Eliminar">
                                  🗑️
                                </button>
                              )}
                            </div>
                          {prov.documentos && prov.documentos.length > 0 && (
                            <button 
                              onClick={() => setModalDocs(prov)}
                              className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 px-2 py-1 rounded w-full max-w-[80px]"
                            >
                              📄 {prov.documentos.length} Docs
                            </button>
                          )}
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

      {/* Modal de Borrado */}
      {proveedorABorrar && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Proveedor?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Estás a punto de eliminar a <span className="font-bold text-white">{proveedorABorrar.razonSocial}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setProveedorABorrar(null)} 
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex-1"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  eliminarProveedor(proveedorABorrar.nit);
                  setProveedorABorrar(null);
                }} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex-1"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Documentos */}
      {modalDocs && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">📄</span> Documentos de {modalDocs.razonSocial}
              </h3>
              <button onClick={() => setModalDocs(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalDocs.documentos.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg mb-2 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-2xl">📑</span>
                    <span className="text-sm font-medium text-slate-200 truncate" title={doc.nombre}>{doc.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button 
                      onClick={() => {
                        try {
                          const arr = doc.base64.split(',');
                          const mime = arr[0].match(/:(.*?);/)[1];
                          const bstr = atob(arr[1]);
                          let n = bstr.length;
                          const u8arr = new Uint8Array(n);
                          while(n--){
                              u8arr[n] = bstr.charCodeAt(n);
                          }
                          const blob = new Blob([u8arr], {type: mime});
                          const url = URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        } catch (e) {
                          console.error("Error abriendo documento", e);
                          descargarDocumento(doc);
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      👁️ Ver PDF
                    </button>
                    <button 
                      onClick={() => descargarDocumento(doc)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                    >
                      ⬇️ Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-right">
              <button onClick={() => setModalDocs(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog
        isOpen={dialogConfig.isOpen}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onConfirm={dialogConfig.onConfirm}
        onCancel={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
      />
    </div>
  );
};

export default CRMProveedores;
