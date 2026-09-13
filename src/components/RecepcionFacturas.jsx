import React, { useState, useMemo } from 'react';
import { useComprasStore } from '../store/useComprasStore';
import Dialog from './Dialog';
import { Search, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

const formatCOP = (valor = 0) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
};

const CLASIFICACIONES = [
  'ADMINISTRACION',
  'MANO DE OBRA',
  'MATERIALES',
  'EQUIPOS Y HERRAMIENTAS',
  'TRANSPORTE',
  'OTROS'
];

const RecepcionFacturas = () => {
  const historialOrdenes = useComprasStore(state => state.historialOrdenes) || [];
  const facturasCausadas = useComprasStore(state => state.facturasCausadas) || [];
  const causarFactura = useComprasStore(state => state.causarFactura);
  const eliminarFactura = useComprasStore(state => state.eliminarFacturaCausada);
  const configTributaria = useComprasStore(state => state.configTributaria);

  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });

  // Estado del formulario
  const [busquedaOC, setBusquedaOC] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    numeroFactura: '',
    fechaFactura: new Date().toISOString().split('T')[0],
    notasPago: 'CREDITO',
    descripcion: '',
    valorAntesIva: 0,
    aplicaIva: true,
    conceptoRetencionId: '', // Para calcular retefuente
    tipoContable: 'Gasto', // Gasto (5) o Costo (7)
    clasificacion: 'MATERIALES',
    cuentaNombre: ''
  });

  // Autocompletado al buscar OC
  const handleBuscarOC = (e) => {
    e.preventDefault();
    const oc = historialOrdenes.find(o => o.consecutivo.toUpperCase() === busquedaOC.toUpperCase());
    if (oc) {
      setOrdenSeleccionada(oc);
      // Extraemos qué retención se le aplicó a la OC si existe
      const retencionOriginal = oc.totales?.retencion?.concepto?.id || '';
      
      setFormData(prev => ({
        ...prev,
        descripcion: `Factura correspondiente a ${oc.consecutivo}`,
        valorAntesIva: oc.totales?.subtotal || 0,
        conceptoRetencionId: retencionOriginal,
        aplicaIva: (oc.totales?.iva > 0)
      }));
    } else {
      setDialogConfig({
        isOpen: true,
        type: 'alert',
        title: 'OC no encontrada',
        message: `No se encontró la Orden de Compra ${busquedaOC.toUpperCase()}`,
        onConfirm: () => setDialogConfig({ isOpen: false })
      });
      setOrdenSeleccionada(null);
    }
  };

  // Cálculos financieros dinámicos
  const calculosFinancieros = useMemo(() => {
    let subtotal = Number(formData.valorAntesIva) || 0;
    
    // IVA
    let iva = 0;
    if (formData.aplicaIva) {
      iva = subtotal * 0.19;
    }

    // Retención
    let retencion = 0;
    const uvt = configTributaria?.uvt || 52289;
    if (formData.conceptoRetencionId && configTributaria?.conceptosRetefuente) {
      const concepto = configTributaria.conceptosRetefuente.find(c => c.id.toString() === formData.conceptoRetencionId.toString());
      if (concepto) {
        // baseUvt o basePesos
        let baseMinimaPesos = concepto.basePesos || 0;
        if (concepto.baseUvt && concepto.baseUvt > 0) {
          baseMinimaPesos = concepto.baseUvt * uvt;
        }

        if (subtotal >= baseMinimaPesos) {
          retencion = subtotal * (concepto.tarifa / 100);
        }
      }
    }

    const valorFinal = subtotal + iva - retencion;

    // Validación contra OC (El semáforo)
    let discrepancia = 0;
    if (ordenSeleccionada) {
      discrepancia = valorFinal - (ordenSeleccionada.totales?.total || 0);
    }

    return { subtotal, iva, retencion, valorFinal, discrepancia };
  }, [formData.valorAntesIva, formData.aplicaIva, formData.conceptoRetencionId, configTributaria, ordenSeleccionada]);

  const handleCausar = (e) => {
    e.preventDefault();
    if (!ordenSeleccionada || !formData.numeroFactura) {
      return setDialogConfig({
        isOpen: true,
        type: 'alert',
        title: 'Faltan Datos',
        message: 'Debes buscar una Orden de Compra y digitar un Número de Factura.',
        onConfirm: () => setDialogConfig({ isOpen: false })
      });
    }

    const factura = {
      ...formData,
      ocRef: ordenSeleccionada.consecutivo,
      proveedorRazon: ordenSeleccionada.proveedor?.razonSocial,
      proveedorNit: ordenSeleccionada.proveedor?.nit,
      centroCosto: ordenSeleccionada.obra?.nombre,
      totales: calculosFinancieros,
      fechaCausacion: new Date().toISOString()
    };

    causarFactura(factura);

    setDialogConfig({
      isOpen: true,
      type: 'alert',
      title: 'Éxito',
      message: `La factura ${formData.numeroFactura} ha sido causada exitosamente y cruzada con la ${ordenSeleccionada.consecutivo}.`,
      onConfirm: () => setDialogConfig({ isOpen: false })
    });

    // Reset form
    setOrdenSeleccionada(null);
    setBusquedaOC('');
    setFormData({
      numeroFactura: '',
      fechaFactura: new Date().toISOString().split('T')[0],
      notasPago: 'CREDITO',
      descripcion: '',
      valorAntesIva: 0,
      aplicaIva: true,
      conceptoRetencionId: '',
      tipoContable: 'Gasto',
      clasificacion: 'MATERIALES',
      cuentaNombre: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <header>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-500" />
            Causación y Recepción de Facturas
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Cruza automáticamente las facturas de proveedores con las Órdenes de Compra generadas.</p>
        </header>

        {/* Panel Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Formulario (Lado Izquierdo) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">1. Localizar Orden</h2>
              
              <form onSubmit={handleBuscarOC} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ej: OC-001"
                  value={busquedaOC}
                  onChange={(e) => setBusquedaOC(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none uppercase"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
                  <Search className="w-4 h-4" /> Buscar
                </button>
              </form>

              {ordenSeleccionada && (
                <div className="mt-4 bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proveedor:</span>
                    <span className="font-bold text-white text-right">{ordenSeleccionada.proveedor?.razonSocial}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Centro Costo (Planta):</span>
                    <span className="font-semibold text-indigo-300 text-right">{ordenSeleccionada.obra?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Esperado (OC):</span>
                    <span className="font-mono font-bold text-emerald-400">{formatCOP(ordenSeleccionada.totales?.total)}</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleCausar} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-5">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">2. Datos de Factura</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">No. FACTURA</label>
                  <input required type="text" value={formData.numeroFactura} onChange={e => setFormData({...formData, numeroFactura: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">FECHA FACTURA</label>
                  <input required type="date" value={formData.fechaFactura} onChange={e => setFormData({...formData, fechaFactura: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">DESCRIPCIÓN</label>
                <input required type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">NOTAS (PAGO)</label>
                  <select value={formData.notasPago} onChange={e => setFormData({...formData, notasPago: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    <option value="CREDITO">Crédito</option>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">VALOR ANTES DE IVA</label>
                  <input required type="number" step="0.01" value={formData.valorAntesIva} onChange={e => setFormData({...formData, valorAntesIva: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 outline-none" />
                </div>
              </div>

              <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2 mt-6">3. Causación Contable</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">TIPO CONTABLE</label>
                  <select value={formData.tipoContable} onChange={e => setFormData({...formData, tipoContable: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    <option value="Gasto">Gasto (Cta 5)</option>
                    <option value="Costo">Costo (Cta 7)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">CLASIFICACIÓN</label>
                  <select value={formData.clasificacion} onChange={e => setFormData({...formData, clasificacion: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    {CLASIFICACIONES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">NOMBRE DE CUENTA</label>
                <input required type="text" placeholder="Ej: DOT. IMPLE. SEGUR" value={formData.cuentaNombre} onChange={e => setFormData({...formData, cuentaNombre: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none uppercase" />
              </div>

              <div className="flex gap-4 items-end mt-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">APLICAR RETEFUENTE</label>
                  <select value={formData.conceptoRetencionId} onChange={e => setFormData({...formData, conceptoRetencionId: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
                    <option value="">No aplica / Ninguna</option>
                    {configTributaria?.conceptosRetefuente?.map(c => (
                      <option key={c.id} value={c.id}>{c.concepto} ({c.tarifa}%)</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id="aplicaIva" checked={formData.aplicaIva} onChange={e => setFormData({...formData, aplicaIva: e.target.checked})} className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900" />
                  <label htmlFor="aplicaIva" className="text-sm text-slate-300 select-none">Sumar IVA (19%)</label>
                </div>
              </div>

              <button type="submit" disabled={!ordenSeleccionada} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Registrar y Causar Factura
              </button>

            </form>
          </div>

          {/* Panel Financiero (Lado Derecho) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tarjeta de Resumen en Vivo */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText className="w-24 h-24" />
              </div>
              
              <h2 className="text-lg font-bold text-white mb-6">Previsualización Contable</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-500 font-semibold mb-1">SUBTOTAL</div>
                  <div className="font-mono font-bold text-white">{formatCOP(calculosFinancieros.subtotal)}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-500 font-semibold mb-1">IVA (19%)</div>
                  <div className="font-mono font-bold text-rose-400">{formData.aplicaIva ? formatCOP(calculosFinancieros.iva) : '$ 0'}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-500 font-semibold mb-1">RETENCIÓN</div>
                  <div className="font-mono font-bold text-amber-400">- {formatCOP(calculosFinancieros.retencion)}</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                  <div className="text-xs text-indigo-400 font-bold mb-1">VALOR FINAL</div>
                  <div className="font-mono font-black text-indigo-400 text-lg">{formatCOP(calculosFinancieros.valorFinal)}</div>
                </div>
              </div>

              {/* Validación Semáforo */}
              {ordenSeleccionada && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${Math.abs(calculosFinancieros.discrepancia) <= 100 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-900/20 border-rose-500/30'}`}>
                  {Math.abs(calculosFinancieros.discrepancia) <= 100 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-emerald-400 text-sm">Conciliación Perfecta ✔️</div>
                        <div className="text-xs text-emerald-400/80 mt-1">El valor final de esta factura concuerda exactamente con la Orden de Compra {ordenSeleccionada.consecutivo}.</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-rose-400 text-sm">Discrepancia Detectada ❌</div>
                        <div className="text-xs text-rose-400/80 mt-1">
                          Hay una diferencia de <strong className="font-mono">{formatCOP(calculosFinancieros.discrepancia)}</strong> respecto al valor original de la Orden de Compra. Verifique los ítems o impuestos antes de causar.
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Historial de Facturas */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-white">Historial de Facturas (Admin/Contabilidad)</h3>
                <span className="bg-indigo-600/20 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {facturasCausadas.length} Registros
                </span>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[1200px]">
                  <thead className="bg-slate-900/50 text-slate-400 font-semibold sticky top-0 backdrop-blur-md z-10 border-b border-slate-700 text-xs">
                    <tr>
                      <th className="p-4">FECHA / OC</th>
                      <th className="p-4">PROVEEDOR</th>
                      <th className="p-4">NO. FACTURA</th>
                      <th className="p-4">NOTAS</th>
                      <th className="p-4 text-right">ANTES IVA</th>
                      <th className="p-4 text-right">VALOR FINAL</th>
                      <th className="p-4 text-center">CUENTA</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {facturasCausadas.slice().reverse().map((f) => (
                      <tr key={f.idFacturaInterno} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-300">{f.fechaFactura}</div>
                          <div className="text-xs font-mono text-indigo-400">{f.ocRef}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{f.proveedorRazon}</div>
                          <div className="text-[10px] text-slate-500">CC: {f.centroCosto}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">{f.numeroFactura}</td>
                        <td className="p-4 text-xs text-slate-400">{f.notasPago}</td>
                        <td className="p-4 text-right font-mono text-slate-400">{formatCOP(f.totales.subtotal)}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-400">{formatCOP(f.totales.valorFinal)}</td>
                        <td className="p-4 text-center">
                          <div className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 inline-block">
                            <span className={f.tipoContable === 'Gasto' ? 'text-amber-400 font-bold' : 'text-blue-400 font-bold'}>
                              {f.tipoContable === 'Gasto' ? '5' : '7'}
                            </span>
                            <span className="text-slate-500 mx-1">-</span>
                            <span className="text-slate-300">{f.cuentaNombre}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              setDialogConfig({
                                isOpen: true,
                                type: 'confirm',
                                title: 'Eliminar Registro',
                                message: `¿Estás seguro de eliminar el registro de la factura ${f.numeroFactura}?`,
                                onConfirm: () => {
                                  eliminarFactura(f.idFacturaInterno);
                                  setDialogConfig({ isOpen: false });
                                }
                              });
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {facturasCausadas.length === 0 && (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-500">
                          Aún no hay facturas causadas registradas.
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

export default RecepcionFacturas;
