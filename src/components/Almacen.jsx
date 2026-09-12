import React, { useState, useMemo } from 'react';
import { useComprasStore } from '../store/useComprasStore';
import { useAuthStore } from '../store/useAuthStore';

const Almacen = () => {
  const { historialOrdenes, entradasAlmacen = [], registrarEntradaAlmacen } = useComprasStore();
  const usuarioActual = useAuthStore(state => state.usuarioActual);
  
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [datosRecepcion, setDatosRecepcion] = useState({ remision: '', observaciones: '' });
  const [itemsRecibiendo, setItemsRecibiendo] = useState({});

  // Función para procesar y calcular el estado logístico de cada orden
  const ordenesProcesadas = useMemo(() => {
    return historialOrdenes.map(orden => {
      // Filtrar entradas de esta orden específica
      const entradasDeEstaOrden = entradasAlmacen.filter(e => e.ordenConsecutivo === orden.consecutivo);
      
      let itemsTotal = 0;
      let itemsRecibidosTotal = 0;

      // Calcular para cada item cuánto se ha recibido
      const itemsCalculados = orden.items.map(item => {
        const cantidadPedida = parseFloat(item.cantidad) || 0;
        let cantidadYaRecibida = 0;
        
        entradasDeEstaOrden.forEach(entrada => {
          const itemEnEntrada = entrada.itemsRecibidos.find(i => i.idItem === item.id);
          if (itemEnEntrada) {
            cantidadYaRecibida += parseFloat(itemEnEntrada.cantidadLlegando) || 0;
          }
        });

        const cantidadPendiente = Math.max(0, cantidadPedida - cantidadYaRecibida);
        const porcentaje = cantidadPedida > 0 ? (cantidadYaRecibida / cantidadPedida) * 100 : 100;

        itemsTotal += cantidadPedida;
        itemsRecibidosTotal += Math.min(cantidadYaRecibida, cantidadPedida);

        return {
          ...item,
          cantidadPedida,
          cantidadYaRecibida,
          cantidadPendiente,
          porcentaje
        };
      });

      let estadoLogistico = 'En Tránsito';
      let porcentajeGlobal = 0;

      if (itemsTotal > 0) {
        porcentajeGlobal = (itemsRecibidosTotal / itemsTotal) * 100;
        if (porcentajeGlobal === 0) estadoLogistico = 'En Tránsito';
        else if (porcentajeGlobal >= 100) estadoLogistico = 'Completada';
        else estadoLogistico = 'Recepción Parcial';
      }

      return {
        ...orden,
        itemsCalculados,
        estadoLogistico,
        porcentajeGlobal: porcentajeGlobal.toFixed(0),
        entradas: entradasDeEstaOrden
      };
    });
  }, [historialOrdenes, entradasAlmacen]);

  const ordenesPendientes = ordenesProcesadas.filter(o => o.estadoLogistico !== 'Completada');
  const ordenesCompletadas = ordenesProcesadas.filter(o => o.estadoLogistico === 'Completada');

  const abrirModalRecepcion = (orden) => {
    setOrdenSeleccionada(orden);
    setDatosRecepcion({ remision: '', observaciones: '' });
    
    // Inicializar inputs de recibo en 0
    const initialItems = {};
    orden.itemsCalculados.forEach(item => {
      initialItems[item.id] = 0; // Por defecto no llega nada
    });
    setItemsRecibiendo(initialItems);
  };

  const handleCantidadChange = (idItem, value, pendienteMax) => {
    let val = parseFloat(value) || 0;
    if (val < 0) val = 0;
    if (val > pendienteMax) val = pendienteMax; // Bloquear ingreso mayor a lo pendiente
    
    setItemsRecibiendo(prev => ({
      ...prev,
      [idItem]: val
    }));
  };

  const guardarRecepcion = () => {
    if (!datosRecepcion.remision) {
      alert("Por favor ingrese el número de remisión o factura del proveedor.");
      return;
    }

    const itemsA_Guardar = Object.keys(itemsRecibiendo)
      .map(idItem => ({
        idItem,
        cantidadLlegando: itemsRecibiendo[idItem]
      }))
      .filter(item => item.cantidadLlegando > 0); // Solo guardar los que llegó al menos 1

    if (itemsA_Guardar.length === 0) {
      alert("Debes indicar al menos un ítem recibido con cantidad mayor a cero.");
      return;
    }

    const nuevaEntrada = {
      ordenConsecutivo: ordenSeleccionada.consecutivo,
      remisionProveedor: datosRecepcion.remision,
      observaciones: datosRecepcion.observaciones,
      recibidoPor: usuarioActual?.nombre || 'Usuario Desconocido',
      itemsRecibidos: itemsA_Guardar
    };

    registrarEntradaAlmacen(nuevaEntrada);
    setOrdenSeleccionada(null);
  };

  const getBadgeStyle = (estado) => {
    if (estado === 'Completada') return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    if (estado === 'Recepción Parcial') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-slate-700 text-slate-300 border border-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Almacén y Recepción
          </h1>
          <p className="text-slate-400 mt-2">
            Control de entradas de material y seguimiento de despachos de proveedores.
          </p>
        </header>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Órdenes En Tránsito</p>
              <p className="text-3xl font-bold text-slate-300 mt-2">
                {ordenesPendientes.filter(o => o.estadoLogistico === 'En Tránsito').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-2xl">
              🚚
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Recepción Parcial</p>
              <p className="text-3xl font-bold text-amber-500 mt-2">
                {ordenesPendientes.filter(o => o.estadoLogistico === 'Recepción Parcial').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-2xl">
              📦
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Completadas al 100%</p>
              <p className="text-3xl font-bold text-teal-500 mt-2">
                {ordenesCompletadas.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-2xl">
              ✅
            </div>
          </div>
        </div>

        {/* Órdenes Pendientes */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Mercancía Pendiente de Ingreso
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">O.C.</th>
                  <th className="py-4 px-6 font-semibold">Proveedor</th>
                  <th className="py-4 px-6 font-semibold">Centro de Costo / Obra</th>
                  <th className="py-4 px-6 font-semibold text-center">Estado</th>
                  <th className="py-4 px-6 font-semibold">Progreso Logístico</th>
                  <th className="py-4 px-6 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {ordenesPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No hay mercancía pendiente. Todo está al día. 🎉
                    </td>
                  </tr>
                ) : (
                  ordenesPendientes.map((orden) => (
                    <tr key={orden.consecutivo} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{orden.consecutivo}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{orden.proveedor?.razonSocial}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {orden.datosObra?.centroCostos} - {orden.datosObra?.ciudadObra}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(orden.estadoLogistico)}`}>
                          {orden.estadoLogistico}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-24">
                            <div 
                              className={`h-full ${orden.porcentajeGlobal > 0 ? 'bg-indigo-500' : 'bg-transparent'}`} 
                              style={{ width: `${orden.porcentajeGlobal}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300">{orden.porcentajeGlobal}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => abrirModalRecepcion(orden)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-xs shadow-lg shadow-indigo-900/20"
                        >
                          Recibir Material
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Modal de Recepción de Material */}
      {ordenSeleccionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📦 Entrada de Almacén para {ordenSeleccionada.consecutivo}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Proveedor: {ordenSeleccionada.proveedor?.razonSocial}</p>
              </div>
              <button onClick={() => setOrdenSeleccionada(null)} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-800 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    N° Remisión / Factura del Proveedor <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={datosRecepcion.remision}
                    onChange={(e) => setDatosRecepcion({...datosRecepcion, remision: e.target.value})}
                    placeholder="Ej: REM-4091"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Observaciones de Recepción
                  </label>
                  <input 
                    type="text" 
                    value={datosRecepcion.observaciones}
                    onChange={(e) => setDatosRecepcion({...datosRecepcion, observaciones: e.target.value})}
                    placeholder="Ej: Material llegó en buen estado"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Descripción del Ítem</th>
                      <th className="py-3 px-4 text-center">Unidad</th>
                      <th className="py-3 px-4 text-center">Pedida</th>
                      <th className="py-3 px-4 text-center text-teal-400">Ya Recibida</th>
                      <th className="py-3 px-4 text-center text-amber-400">Pendiente</th>
                      <th className="py-3 px-4 text-center bg-indigo-500/10 text-indigo-300 w-32">
                        Cantidad que Entra HOY
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {ordenSeleccionada.itemsCalculados.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/20">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-200">{item.descripcion}</p>
                          <p className="text-[10px] text-slate-500">Cód: {item.codigo}</p>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">{item.unidad || 'UND'}</td>
                        <td className="py-3 px-4 text-center font-mono">{item.cantidadPedida}</td>
                        <td className="py-3 px-4 text-center font-mono text-teal-400 font-bold">{item.cantidadYaRecibida}</td>
                        <td className="py-3 px-4 text-center font-mono text-amber-400 font-bold">
                          {item.cantidadPendiente}
                        </td>
                        <td className="py-2 px-4 bg-indigo-500/5">
                          {item.cantidadPendiente === 0 ? (
                            <div className="text-center text-xs text-teal-500 font-bold bg-teal-500/10 py-1.5 rounded">
                              COMPLETO
                            </div>
                          ) : (
                            <input 
                              type="number"
                              min="0"
                              max={item.cantidadPendiente}
                              value={itemsRecibiendo[item.id] === 0 ? '' : itemsRecibiendo[item.id]}
                              onChange={(e) => handleCantidadChange(item.id, e.target.value, item.cantidadPendiente)}
                              placeholder="0"
                              className="w-full bg-slate-900 border border-indigo-500/30 rounded px-2 py-1.5 text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setOrdenSeleccionada(null)}
                className="px-6 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 transition-colors border border-slate-700"
              >
                Cancelar
              </button>
              <button 
                onClick={guardarRecepcion}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-900/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Registrar Entrada de Almacén
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Almacen;
