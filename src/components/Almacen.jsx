import React, { useState, useMemo } from 'react';
import { useComprasStore } from '../store/useComprasStore';
import Dialog from './Dialog';
import { useAuthStore } from '../store/useAuthStore';
import { Package, Send, LayoutList, Search, Plus, FileText, CheckCircle2 } from 'lucide-react';

const formatCOP = (valor = 0) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
};

const Almacen = () => {
  const { 
    historialOrdenes, 
    entradasAlmacen = [], 
    registrarEntradaAlmacen,
    inventario = [],
    movimientosInventario = [],
    registrarMovimientoInventario
  } = useComprasStore();
  
  const usuarioActual = useAuthStore(state => state.usuarioActual);
  
  // TABS: 'recepcion', 'salidas', 'kardex'
  const [activeTab, setActiveTab] = useState('recepcion');

  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [datosRecepcion, setDatosRecepcion] = useState({ remision: '', observaciones: '' });
  const [itemsRecibiendo, setItemsRecibiendo] = useState({});
  const [itemsStockMinimo, setItemsStockMinimo] = useState({});
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  // -------------------------------------------------------------
  // LÓGICA DE RECEPCIÓN (TAB 1)
  // -------------------------------------------------------------
  const ordenesProcesadas = useMemo(() => {
    return historialOrdenes.map(orden => {
      const entradasDeEstaOrden = entradasAlmacen.filter(e => e.ordenConsecutivo === orden.consecutivo);
      
      let itemsTotal = 0;
      let itemsRecibidosTotal = 0;

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

        return { ...item, cantidadPedida, cantidadYaRecibida, cantidadPendiente, porcentaje };
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
    const initialItems = {};
    const initialMinimos = {};
    orden.itemsCalculados.forEach(item => { 
      initialItems[item.id] = 0; 
      initialMinimos[item.id] = 5; // Por defecto 5, configurable por el usuario
    });
    setItemsRecibiendo(initialItems);
    setItemsStockMinimo(initialMinimos);
  };

  const handleCantidadChange = (idItem, value, pendienteMax) => {
    let val = parseFloat(value) || 0;
    if (val < 0) val = 0;
    if (val > pendienteMax) val = pendienteMax;
    setItemsRecibiendo(prev => ({ ...prev, [idItem]: val }));
  };

  const handleStockMinimoChange = (idItem, value) => {
    let val = parseFloat(value) || 0;
    if (val < 0) val = 0;
    setItemsStockMinimo(prev => ({ ...prev, [idItem]: val }));
  };

  const guardarRecepcion = () => {
    if (!datosRecepcion.remision) {
      return setDialogConfig({ isOpen: true, type: 'alert', title: 'Atención', message: "Por favor ingrese el número de remisión o factura del proveedor.", onConfirm: () => setDialogConfig({ isOpen: false }) });
    }

    const itemsA_Guardar = Object.keys(itemsRecibiendo)
      .map(idItem => {
        const itemObj = ordenSeleccionada.itemsCalculados.find(i => i.id === idItem);
        return {
          idItem,
          cantidadLlegando: itemsRecibiendo[idItem],
          stockMinimo: itemsStockMinimo[idItem] || 5,
          ...itemObj
        };
      })
      .filter(item => item.cantidadLlegando > 0);

    if (itemsA_Guardar.length === 0) {
      return setDialogConfig({ isOpen: true, type: 'alert', title: 'Atención', message: "Debes indicar al menos un ítem recibido con cantidad mayor a cero.", onConfirm: () => setDialogConfig({ isOpen: false }) });
    }

    const nuevaEntrada = {
      ordenConsecutivo: ordenSeleccionada.consecutivo,
      remisionProveedor: datosRecepcion.remision,
      observaciones: datosRecepcion.observaciones,
      recepcionista: usuarioActual?.nombre || 'Usuario Desconocido',
      items: itemsA_Guardar.map(i => ({
        id: i.idItem,
        codigo: i.codigo,
        descripcion: i.descripcion,
        unidad: i.unidad,
        cantidadRecibida: i.cantidadLlegando,
        precioUnitario: i.valorUnitario,
        stockMinimo: i.stockMinimo
      })),
      itemsRecibidos: itemsA_Guardar // Mantenemos retrocompatibilidad con vista anterior
    };

    registrarEntradaAlmacen(nuevaEntrada);
    setOrdenSeleccionada(null);
    setDialogConfig({ isOpen: true, type: 'alert', title: 'Éxito', message: 'Material recibido e ingresado al inventario correctamente.', onConfirm: () => setDialogConfig({ isOpen: false }) });
  };

  const getBadgeStyle = (estado) => {
    if (estado === 'Completada') return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    if (estado === 'Recepción Parcial') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-slate-700 text-slate-300 border border-slate-600';
  };

  // -------------------------------------------------------------
  // LÓGICA DE SALIDAS / DESPACHOS (TAB 2)
  // -------------------------------------------------------------
  const [salidaData, setSalidaData] = useState({
    sku: '',
    cantidad: 1,
    referencia: '', // Ej: Vale Salida 001
    responsable: ''
  });
  
  const handleRegistrarSalida = (e) => {
    e.preventDefault();
    const itemEnInventario = inventario.find(i => i.sku.toUpperCase() === salidaData.sku.toUpperCase() || i.descripcion.toUpperCase() === salidaData.sku.toUpperCase());
    
    if (!itemEnInventario) {
      return setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'El ítem/código no se encuentra en el inventario.', onConfirm: () => setDialogConfig({ isOpen: false }) });
    }

    if (itemEnInventario.saldo < salidaData.cantidad) {
      return setDialogConfig({ isOpen: true, type: 'alert', title: 'Saldo Insuficiente', message: `Solo hay ${itemEnInventario.saldo} unidades disponibles en stock de ${itemEnInventario.descripcion}.`, onConfirm: () => setDialogConfig({ isOpen: false }) });
    }

    registrarMovimientoInventario({
      tipo: 'SALIDA',
      sku: itemEnInventario.sku,
      descripcion: itemEnInventario.descripcion,
      unidad: itemEnInventario.unidad,
      cantidad: salidaData.cantidad,
      costoUnitario: itemEnInventario.costoPromedio,
      referencia: salidaData.referencia || 'Despacho Interno',
      responsable: salidaData.responsable
    });

    setDialogConfig({ isOpen: true, type: 'alert', title: 'Salida Registrada', message: `Se descontaron ${salidaData.cantidad} unidades de ${itemEnInventario.descripcion}.`, onConfirm: () => setDialogConfig({ isOpen: false }) });
    setSalidaData({ sku: '', cantidad: 1, referencia: '', responsable: '' });
  };

  // -------------------------------------------------------------
  // VISTAS (TABS)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="border-b border-slate-700 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-500" />
              Almacén e Inventarios
            </h1>
            <p className="text-slate-400 mt-2">
              Gestión centralizada de Recepción, KARDEX y Entregas de material.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('recepcion')} className={`px-4 py-2 text-sm font-bold rounded-lg border flex items-center gap-2 transition-all ${activeTab === 'recepcion' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              <Plus className="w-4 h-4" /> Recepción OC
            </button>
            <button onClick={() => setActiveTab('salidas')} className={`px-4 py-2 text-sm font-bold rounded-lg border flex items-center gap-2 transition-all ${activeTab === 'salidas' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              <Send className="w-4 h-4" /> Salidas (Despacho)
            </button>
            <button onClick={() => setActiveTab('kardex')} className={`px-4 py-2 text-sm font-bold rounded-lg border flex items-center gap-2 transition-all ${activeTab === 'kardex' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              <LayoutList className="w-4 h-4" /> Maestro KARDEX
            </button>
          </div>
        </header>

        {/* ================= TAB 1: RECEPCIÓN ================= */}
        {activeTab === 'recepcion' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Órdenes En Tránsito</p>
                  <p className="text-3xl font-bold text-slate-300 mt-2">
                    {ordenesPendientes.filter(o => o.estadoLogistico === 'En Tránsito').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-2xl">🚚</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Recepción Parcial</p>
                  <p className="text-3xl font-bold text-amber-500 mt-2">
                    {ordenesPendientes.filter(o => o.estadoLogistico === 'Recepción Parcial').length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-2xl">📦</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">Completadas al 100%</p>
                  <p className="text-3xl font-bold text-teal-500 mt-2">{ordenesCompletadas.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-2xl">✅</div>
              </div>
            </div>

            <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-700 bg-slate-900/30">
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
                      <th className="py-4 px-6 font-semibold">Centro Costo</th>
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
                        <tr key={orden.consecutivo} className="hover:bg-slate-700/30">
                          <td className="py-4 px-6 font-bold text-white">{orden.consecutivo}</td>
                          <td className="py-4 px-6 font-semibold text-slate-200">{orden.proveedor?.razonSocial}</td>
                          <td className="py-4 px-6 text-slate-300">{orden.datosObra?.centroCostos}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${getBadgeStyle(orden.estadoLogistico)}`}>
                              {orden.estadoLogistico}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-24">
                                <div className={`h-full ${orden.porcentajeGlobal > 0 ? 'bg-indigo-500' : 'bg-transparent'}`} style={{ width: `${orden.porcentajeGlobal}%` }}></div>
                              </div>
                              <span className="text-xs font-mono font-bold text-slate-300">{orden.porcentajeGlobal}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button onClick={() => abrirModalRecepcion(orden)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-lg">
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
        )}

        {/* ================= TAB 2: SALIDAS / DESPACHO ================= */}
        {activeTab === 'salidas' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
              <h2 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                Despacho Rápido (Salidas)
              </h2>
              <form onSubmit={handleRegistrarSalida} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">CÓDIGO SKU / NOMBRE DEL ÍTEM (Pistola Lector)</label>
                  <input required type="text" value={salidaData.sku} onChange={e => setSalidaData({...salidaData, sku: e.target.value})} placeholder="Escanee el código de barras o digite" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none uppercase font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">CANTIDAD A ENTREGAR</label>
                    <input required type="number" min="1" step="0.01" value={salidaData.cantidad} onChange={e => setSalidaData({...salidaData, cantidad: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">NO. VALE / REFERENCIA</label>
                    <input type="text" value={salidaData.referencia} onChange={e => setSalidaData({...salidaData, referencia: e.target.value})} placeholder="Vale de salida..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">ENTREGADO A (Responsable / Trabajador)</label>
                  <input required type="text" value={salidaData.responsable} onChange={e => setSalidaData({...salidaData, responsable: e.target.value})} placeholder="Nombre de quien recibe" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none" />
                </div>
                <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl mt-4 transition-colors">
                  Registrar Salida
                </button>
              </form>
            </div>
            
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 overflow-hidden flex flex-col h-[500px]">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Últimos Movimientos</h2>
              <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                {movimientosInventario.slice(0, 15).map(mov => (
                  <div key={mov.idMovimiento} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${mov.tipo === 'ENTRADA' ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {mov.tipo}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{new Date(mov.fecha).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-200 mt-1 truncate max-w-[200px]">{mov.descripcion}</p>
                      <p className="text-[10px] text-slate-400">Ref: {mov.referencia} | Resp: {mov.responsable}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold text-lg ${mov.tipo === 'ENTRADA' ? 'text-teal-400' : 'text-rose-400'}`}>
                        {mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.cantidad}
                      </p>
                      <p className="text-[10px] text-slate-500">{mov.unidad || 'UND'}</p>
                    </div>
                  </div>
                ))}
                {movimientosInventario.length === 0 && <p className="text-slate-500 text-sm text-center mt-10">No hay movimientos recientes.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: MAESTRO KARDEX ================= */}
        {activeTab === 'kardex' && (
          <div className="space-y-6">
            
            {/* Dashboard de Alertas */}
            {inventario.some(item => item.saldo <= (item.stockMinimo || 5)) && (
              <section className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 mb-6">
                <h3 className="text-rose-400 font-bold text-lg mb-4 flex items-center gap-2">
                  <span>⚠️</span> Alerta de Stock Bajo (Punto de Reorden)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {inventario.filter(item => item.saldo <= (item.stockMinimo || 5)).map(item => (
                    <div key={item.id} className="bg-rose-950/50 rounded-xl p-4 border border-rose-500/20 shadow-sm flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-mono text-rose-300">{item.sku}</p>
                        <p className="font-bold text-slate-200 mt-1 line-clamp-2" title={item.descripcion}>{item.descripcion}</p>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <span className="text-xs text-rose-400">Mín: {item.stockMinimo || 5}</span>
                        <span className="text-xl font-bold text-rose-500">{item.saldo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden flex flex-col h-[70vh]">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/30 shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-indigo-500" />
                  Maestro de Inventario (Saldos Costeados)
                </h2>
                <div className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg">
                  Valor Total Inventario: {formatCOP(inventario.reduce((acc, curr) => acc + curr.valorTotal, 0))}
                </div>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-4 px-6 font-semibold">SKU / CÓDIGO</th>
                      <th className="py-4 px-6 font-semibold">DESCRIPCIÓN</th>
                      <th className="py-4 px-6 font-semibold text-center">ENTRADAS</th>
                      <th className="py-4 px-6 font-semibold text-center">SALIDAS</th>
                      <th className="py-4 px-6 font-semibold text-center text-teal-400 bg-teal-500/10">SALDO STOCK</th>
                      <th className="py-4 px-6 font-semibold text-right">COSTO PROM.</th>
                      <th className="py-4 px-6 font-semibold text-right">VALORIZACIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {inventario.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">El inventario está vacío.</td>
                      </tr>
                    ) : (
                      inventario.map(item => {
                        const isLowStock = item.saldo <= (item.stockMinimo || 5);
                        return (
                          <tr key={item.id} className={`transition-colors ${isLowStock ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-slate-700/30'}`}>
                            <td className="py-3 px-6 font-mono text-slate-400 text-xs">
                              {isLowStock && <span className="mr-2 text-rose-500" title="Stock Bajo">⚠️</span>}
                              {item.sku}
                            </td>
                            <td className="py-3 px-6 font-bold text-slate-200">{item.descripcion} <span className="text-[10px] font-normal text-slate-500 ml-1">({item.unidad})</span></td>
                            <td className="py-3 px-6 text-center text-slate-400 font-mono">{item.entradas}</td>
                            <td className="py-3 px-6 text-center text-rose-400 font-mono">{item.salidas}</td>
                            <td className={`py-3 px-6 text-center font-bold font-mono text-lg ${isLowStock ? 'text-rose-400 bg-rose-500/10' : 'text-teal-400 bg-teal-500/5'}`}>{item.saldo}</td>
                            <td className="py-3 px-6 text-right font-mono text-slate-400">{formatCOP(item.costoPromedio)}</td>
                            <td className="py-3 px-6 text-right font-mono font-bold text-indigo-400">{formatCOP(item.valorTotal)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

      </div>

      {/* Modal de Recepción (TAB 1) */}
      {ordenSeleccionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-4xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">📦 Entrada de Almacén para {ordenSeleccionada.consecutivo}</h3>
                <p className="text-xs text-slate-400 mt-1">Proveedor: {ordenSeleccionada.proveedor?.razonSocial}</p>
              </div>
              <button onClick={() => setOrdenSeleccionada(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-800 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">N° Remisión / Factura <span className="text-rose-500">*</span></label>
                  <input type="text" value={datosRecepcion.remision} onChange={(e) => setDatosRecepcion({...datosRecepcion, remision: e.target.value})} placeholder="Ej: REM-4091" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observaciones</label>
                  <input type="text" value={datosRecepcion.observaciones} onChange={(e) => setDatosRecepcion({...datosRecepcion, observaciones: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-xs text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Descripción del Ítem</th>
                      <th className="py-3 px-4 text-center">Pedida</th>
                      <th className="py-3 px-4 text-center text-teal-400">Ya Recibida</th>
                      <th className="py-3 px-4 text-center text-amber-400">Pendiente</th>
                      <th className="py-3 px-4 text-center text-rose-400 w-24">Stock Mín.</th>
                      <th className="py-3 px-4 text-center bg-indigo-500/10 text-indigo-300 w-32">Cantidad a Recibir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {ordenSeleccionada.itemsCalculados.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-700/20">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-200">{item.descripcion}</p>
                          <p className="text-[10px] text-slate-500">SKU: {item.codigo}</p>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{item.cantidadPedida}</td>
                        <td className="py-3 px-4 text-center font-mono text-teal-400 font-bold">{item.cantidadYaRecibida}</td>
                        <td className="py-3 px-4 text-center font-mono text-amber-400 font-bold">{item.cantidadPendiente}</td>
                        <td className="py-2 px-4">
                          <input 
                            type="number" min="0"
                            value={itemsStockMinimo[item.id] !== undefined ? itemsStockMinimo[item.id] : 5}
                            onChange={(e) => handleStockMinimoChange(item.id, e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-rose-300 text-center font-mono focus:outline-none focus:border-rose-500"
                            title="Alerta si el saldo baja de este valor"
                          />
                        </td>
                        <td className="py-2 px-4 bg-indigo-500/5">
                          {item.cantidadPendiente === 0 ? (
                            <div className="text-center text-xs text-teal-500 font-bold bg-teal-500/10 py-1.5 rounded">COMPLETO</div>
                          ) : (
                            <input 
                              type="number" min="0" max={item.cantidadPendiente}
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
              <button onClick={() => setOrdenSeleccionada(null)} className="px-6 py-2.5 rounded-lg text-slate-300 font-bold hover:bg-slate-800 border border-slate-700">Cancelar</button>
              <button onClick={guardarRecepcion} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                Registrar Entrada a KARDEX
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Dialog isOpen={dialogConfig.isOpen} title={dialogConfig.title} message={dialogConfig.message} type={dialogConfig.type} onConfirm={dialogConfig.onConfirm} onCancel={() => setDialogConfig({ ...dialogConfig, isOpen: false })} />
    </div>
  );
};

export default Almacen;
