import React, { useState, useEffect } from 'react';
import { useComprasStore } from '../store/useComprasStore';
import Dialog from './Dialog';

const ConfiguracionTributaria = () => {
  const empresaActual = useComprasStore((state) => state.empresaEmisora);
  const actualizarEmpresa = useComprasStore((state) => state.actualizarEmpresa);
  
  const configActual = useComprasStore((state) => state.configTributaria);
  const actualizarConfigTributaria = useComprasStore((state) => state.actualizarConfigTributaria);

  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'alert', title: 'Atención', message: '', onConfirm: null });

  const [empresaForm, setEmpresaForm] = useState(empresaActual);

  const [uvt, setUvt] = useState(configActual.uvt || 52289);
  
  const [conceptosRetefuente, setConceptosRetefuente] = useState(configActual.conceptosRetefuente || []);
  const [tarifasIca, setTarifasIca] = useState(configActual.tarifasIca || []);

  useEffect(() => {
    actualizarConfigTributaria({ uvt, conceptosRetefuente, tarifasIca });
  }, [uvt, conceptosRetefuente, tarifasIca]);
  const [nuevoConcepto, setNuevoConcepto] = useState({ concepto: '', baseUvt: '', porcentaje: '' });
  const [mostrarFormConcepto, setMostrarFormConcepto] = useState(false);
  const [editandoConceptoId, setEditandoConceptoId] = useState(null);
  
  const [nuevaCiudad, setNuevaCiudad] = useState('');
  const [nuevaActividad, setNuevaActividad] = useState('');
  const [nuevaTarifa, setNuevaTarifa] = useState('');
  const [mostrarFormIca, setMostrarFormIca] = useState(false);
  const [editandoMunicipioId, setEditandoMunicipioId] = useState(null);

  const handleAgregarConcepto = () => {
    if (!nuevoConcepto.concepto || nuevoConcepto.baseUvt === '' || nuevoConcepto.porcentaje === '') return;
    
    if (editandoConceptoId) {
      setConceptosRetefuente(conceptosRetefuente.map(c => 
        c.id === editandoConceptoId 
          ? { ...c, concepto: nuevoConcepto.concepto, baseUvt: Number(nuevoConcepto.baseUvt), porcentaje: Number(nuevoConcepto.porcentaje) }
          : c
      ));
      setEditandoConceptoId(null);
    } else {
      setConceptosRetefuente([
        ...conceptosRetefuente,
        {
          id: Date.now(),
          concepto: nuevoConcepto.concepto,
          baseUvt: Number(nuevoConcepto.baseUvt),
          porcentaje: Number(nuevoConcepto.porcentaje)
        }
      ]);
    }
    setNuevoConcepto({ concepto: '', baseUvt: '', porcentaje: '' });
    setMostrarFormConcepto(false);
  };

  const handleEditarConcepto = (item) => {
    setNuevoConcepto({ concepto: item.concepto, baseUvt: item.baseUvt, porcentaje: item.porcentaje });
    setEditandoConceptoId(item.id);
    setMostrarFormConcepto(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarConcepto = (id) => {
    setConceptosRetefuente(conceptosRetefuente.filter(c => c.id !== id));
  };

  const handleAgregarMunicipio = () => {
    if (!nuevaCiudad || !nuevaTarifa) return;
    
    if (editandoMunicipioId) {
      setTarifasIca(tarifasIca.map(t => 
        t.id === editandoMunicipioId
          ? { ...t, ciudad: nuevaCiudad.toUpperCase(), actividad: nuevaActividad || 'General', tarifa: nuevaTarifa }
          : t
      ));
      setEditandoMunicipioId(null);
    } else {
      setTarifasIca([
        ...tarifasIca,
        {
          id: Date.now(),
          ciudad: nuevaCiudad.toUpperCase(),
          actividad: nuevaActividad || 'General',
          tarifa: nuevaTarifa,
          estado: 'Activo'
        }
      ]);
    }
    
    setNuevaCiudad('');
    setNuevaActividad('');
    setNuevaTarifa('');
    setMostrarFormIca(false);
  };

  const handleEditarMunicipio = (item) => {
    setNuevaCiudad(item.ciudad);
    setNuevaActividad(item.actividad);
    setNuevaTarifa(item.tarifa);
    setEditandoMunicipioId(item.id);
    setMostrarFormIca(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarMunicipio = (id) => {
    setTarifasIca(tarifasIca.filter(t => t.id !== id));
  };

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

        {/* Configuración de la Empresa Emisora */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Datos de la Empresa Emisora (Multi-tenant)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-2">Razón Social</label>
              <input
                type="text"
                value={empresaForm.nombre}
                onChange={(e) => setEmpresaForm({...empresaForm, nombre: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-2">NIT</label>
              <input
                type="text"
                value={empresaForm.nit}
                onChange={(e) => setEmpresaForm({...empresaForm, nit: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-slate-400 mb-2">Dirección Principal</label>
              <input
                type="text"
                value={empresaForm.direccion}
                onChange={(e) => setEmpresaForm({...empresaForm, direccion: e.target.value})}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Esta información aparecerá en el membrete superior (cabecera) de todos los PDF exportados.
          </p>
        </section>

        {/* Variables Nacionales (UVT) */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Valor UVT Nacional
          </h2>
          
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 max-w-sm">
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
        </section>

        {/* Matriz de Conceptos de Retefuente */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Matriz de Conceptos (Retefuente)
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setDialogConfig({
                    isOpen: true,
                    type: 'confirm',
                    title: 'Restablecer Valores DIAN',
                    message: '¿Deseas sobreescribir tus conceptos actuales con la tabla oficial de la DIAN?',
                    onConfirm: () => {
                      setConceptosRetefuente([
                        { id: 1, concepto: 'Honorarios y Consultorías', baseUvt: 0, basePesos: 0, tarifa: 11.0 },
                        { id: 2, concepto: 'Honorarios (No declarantes)', baseUvt: 0, basePesos: 0, tarifa: 10.0 },
                        { id: 3, concepto: 'Servicios Generales (Declarantes)', baseUvt: 4, basePesos: 0, tarifa: 4.0 },
                        { id: 4, concepto: 'Servicios Generales (No declarantes)', baseUvt: 4, basePesos: 0, tarifa: 6.0 },
                        { id: 5, concepto: 'Compras Generales (Declarantes)', baseUvt: 27, basePesos: 0, tarifa: 2.5 },
                        { id: 6, concepto: 'Compras Generales (No declarantes)', baseUvt: 27, basePesos: 0, tarifa: 3.5 },
                      ]);
                      setDialogConfig({ isOpen: false });
                    },
                  });
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-600"
              >
                Cargar Tabla DIAN
              </button>
              <button 
                onClick={() => setMostrarFormConcepto(!mostrarFormConcepto)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {mostrarFormConcepto ? 'Cancelar' : '+ Agregar Concepto'}
              </button>
            </div>
          </div>
          
          {mostrarFormConcepto && (
            <div className="p-4 bg-slate-900 border-b border-slate-700 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Concepto de Retención</label>
                <input 
                  type="text" 
                  value={nuevoConcepto.concepto} 
                  onChange={e => setNuevoConcepto({...nuevoConcepto, concepto: e.target.value})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" 
                  placeholder="Ej. Honorarios" 
                />
              </div>
              <div className="w-32">
                <label className="block text-xs text-slate-400 mb-1">Base (UVT)</label>
                <input 
                  type="number" 
                  value={nuevoConcepto.baseUvt} 
                  onChange={e => setNuevoConcepto({...nuevoConcepto, baseUvt: e.target.value})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" 
                  placeholder="Ej. 27" 
                />
              </div>
              <div className="w-32">
                <label className="block text-xs text-slate-400 mb-1">Tarifa (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={nuevoConcepto.porcentaje} 
                  onChange={e => setNuevoConcepto({...nuevoConcepto, porcentaje: e.target.value})} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500" 
                  placeholder="Ej. 2.5" 
                />
              </div>
              <button 
                onClick={handleAgregarConcepto}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-lg text-sm"
              >
                {editandoConceptoId ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Concepto</th>
                  <th className="py-4 px-6 font-semibold text-right">Base (UVT)</th>
                  <th className="py-4 px-6 font-semibold text-right">Monto Base (COP)</th>
                  <th className="py-4 px-6 font-semibold text-right">Tarifa (%)</th>
                  <th className="py-4 px-6 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {conceptosRetefuente.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{item.concepto}</td>
                    <td className="py-4 px-6 text-right font-mono text-slate-300">{item.baseUvt} UVT</td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-400">
                      ${new Intl.NumberFormat('es-CO').format(item.baseUvt * uvt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-mono font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
                        {item.porcentaje}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center flex justify-center gap-2">
                       <button 
                         onClick={() => handleEditarConcepto(item)} 
                         className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors" 
                         title="Editar"
                       >
                         ✏️
                       </button>
                       <button 
                         onClick={() => {
                           setDialogConfig({
                             isOpen: true,
                             type: 'confirm',
                             title: 'Eliminar Concepto',
                             message: `¿Borrar concepto ${item.concepto}?`,
                             onConfirm: () => {
                               handleEliminarConcepto(item.id);
                               setDialogConfig({ isOpen: false });
                             }
                           });
                         }}
                         className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors" 
                         title="Eliminar"
                       >
                         🗑️
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Matriz de Territorialidad ICA */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Matriz de Territorialidad (ReteICA)
            </h2>
            <button 
              onClick={() => setMostrarFormIca(!mostrarFormIca)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {mostrarFormIca ? 'Cancelar' : '+ Agregar Municipio'}
            </button>
          </div>
          
          {mostrarFormIca && (
            <div className="p-4 bg-slate-900 border-b border-slate-700 flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Ciudad / Municipio</label>
                <input 
                  type="text" 
                  value={nuevaCiudad} 
                  onChange={e => setNuevaCiudad(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
                  placeholder="Ej. BOGOTÁ" 
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-400 mb-1">Actividad</label>
                <select 
                  value={nuevaActividad} 
                  onChange={e => setNuevaActividad(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="Actividad Industrial">Actividad Industrial</option>
                  <option value="Actividad Comercial">Actividad Comercial</option>
                  <option value="Actividad de Servicios">Actividad de Servicios</option>
                  <option value="Obras Civiles y Construcción">Obras Civiles y Construcción</option>
                  <option value="Sector Financiero">Sector Financiero</option>
                  <option value="General / Otra">General / Otra</option>
                </select>
              </div>
              <div className="w-32">
                <label className="block text-xs text-slate-400 mb-1">Tarifa (x Mil)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={nuevaTarifa} 
                  onChange={e => setNuevaTarifa(e.target.value)} 
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" 
                  placeholder="Ej. 11.04" 
                />
              </div>
              <button 
                onClick={handleAgregarMunicipio}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-sm"
              >
                {editandoMunicipioId ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Ciudad / Municipio</th>
                  <th className="py-4 px-6 font-semibold">Actividad Económica</th>
                  <th className="py-4 px-6 font-semibold text-right">Tarifa (x Mil)</th>
                  <th className="py-4 px-6 font-semibold text-center">Acciones</th>
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
                    <td className="py-4 px-6 text-center flex justify-center gap-2">
                       <button 
                         onClick={() => handleEditarMunicipio(item)} 
                         className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded transition-colors" 
                         title="Editar"
                       >
                         ✏️
                       </button>
                       <button 
                         onClick={() => {
                           setDialogConfig({
                             isOpen: true,
                             type: 'confirm',
                             title: 'Eliminar Municipio',
                             message: `¿Borrar municipio ${item.ciudad}?`,
                             onConfirm: () => {
                               handleEliminarMunicipio(item.id);
                               setDialogConfig({ isOpen: false });
                             }
                           });
                         }}
                         className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors" 
                         title="Eliminar"
                       >
                         🗑️
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            onClick={() => {
              actualizarEmpresa(empresaForm);
              actualizarConfigTributaria({ uvt, conceptosRetefuente, tarifasIca });
              setDialogConfig({
                isOpen: true,
                type: 'alert',
                title: 'Éxito',
                message: 'Configuración guardada exitosamente. Las variables se han sincronizado con el motor de impuestos.',
                onConfirm: () => setDialogConfig({ isOpen: false })
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/50 transition-all"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
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

export default ConfiguracionTributaria;
