import React, { useMemo, useState } from 'react';
import { useComprasStore } from '../store/useComprasStore';
import Dialog from './Dialog';

const CuentasPorPagar = () => {
  const historialOrdenes = useComprasStore((state) => state.historialOrdenes);
  const actualizarEstadoPagoOrden = useComprasStore((state) => state.actualizarEstadoPagoOrden);

  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });

  const formatCOP = (valor) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor || 0);

  // Función segura para parsear fechas y evitar el bug de MM/DD vs DD/MM
  const parseFechaSegura = (fechaStr) => {
    if (!fechaStr) return new Date();
    if (fechaStr.includes('-')) return new Date(fechaStr + 'T00:00:00');
    if (fechaStr.includes('/')) {
      const partes = fechaStr.split('/');
      // En Colombia el formato generado fue DD/MM/YYYY (ej. 12/9/2026 = 12 de Septiembre)
      // JS 'new Date()' erróneamente lo leía como MM/DD/YYYY (9 de Diciembre)
      const dia = parseInt(partes[0]);
      const mes = parseInt(partes[1]);
      const anio = parseInt(partes[2]);
      
      return new Date(anio, mes - 1, dia);
    }
    return new Date(fechaStr);
  };

  // Calcular y filtrar órdenes
  const radarCxP = useMemo(() => {
    const ahora = new Date();
    // Normalizamos hoy a la medianoche para comparar solo fechas
    ahora.setHours(0, 0, 0, 0);

    const filtradas = historialOrdenes
      .filter((o) => {
        // Solo ordenes que en su forma de pago digan "Crédito" o similar, y que NO estén pagadas
        const esCredito = o.proveedor?.formaPago?.toLowerCase().includes('crédito') || 
                          o.proveedor?.formaPago?.toLowerCase().includes('credito');
        return esCredito;
      })
      .map((o) => {
        // Extraer número de días del string "Crédito 30 días"
        const diasMatch = o.proveedor?.formaPago?.match(/\d+/);
        const diasPlazo = diasMatch ? parseInt(diasMatch[0]) : 30; // Por defecto 30 si falla
        
        const fechaEmision = parseFechaSegura(o.fecha);
        fechaEmision.setHours(0, 0, 0, 0);
        
        const fechaVencimiento = new Date(fechaEmision.getTime() + (diasPlazo * 24 * 60 * 60 * 1000));
        
        // Diferencia en milisegundos / milisegundos por día
        const diasRestantes = Math.round((fechaVencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
        
        let semaforo = 'gris';
        let badgeText = 'Desconocido';
        
        if (o.estadoPago === 'Pagado') {
          semaforo = 'verde-ok';
          badgeText = 'Pagado';
        } else if (diasRestantes < 0) {
          semaforo = 'rojo'; // Vencido (Mora)
          badgeText = `Vencido (${Math.abs(diasRestantes)} días)`;
        } else if (diasRestantes <= 7) {
          semaforo = 'amarillo'; // Por vencer pronto
          badgeText = `Próximo a vencer (${diasRestantes} días)`;
        } else {
          semaforo = 'verde'; // Al día
          badgeText = `Al día (${diasRestantes} días restantes)`;
        }

        return {
          ...o,
          diasPlazo,
          fechaVencimiento,
          diasRestantes,
          semaforo,
          badgeText
        };
      })
      // Ordenar: primero los más vencidos (días negativos), luego los que vencen pronto
      .sort((a, b) => a.diasRestantes - b.diasRestantes);

    return filtradas;
  }, [historialOrdenes]);

  const cxpPendientes = radarCxP.filter(o => o.estadoPago !== 'Pagado');
  const cxpPagadas = radarCxP.filter(o => o.estadoPago === 'Pagado');

  // Totalizadores
  const totalMora = cxpPendientes.filter(o => o.semaforo === 'rojo').reduce((acc, o) => acc + (o.totales?.total || 0), 0);
  const totalPorVencer = cxpPendientes.filter(o => o.semaforo === 'amarillo' || o.semaforo === 'verde').reduce((acc, o) => acc + (o.totales?.total || 0), 0);

  const getSemaforoStyle = (color) => {
    switch(color) {
      case 'rojo': return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'amarillo': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'verde': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'verde-ok': return 'bg-teal-500/20 text-teal-300 border border-teal-500/30 line-through opacity-70';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="border-b border-slate-700 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Radar Cuentas por Pagar (CxP)
            </h1>
            <p className="text-slate-400 mt-2">
              Gestión automática de cartera y vencimientos de órdenes a crédito.
            </p>
          </div>
        </header>

        {/* Dashboards de Totales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Cartera Vencida (Mora)</p>
              <p className="text-3xl font-bold text-rose-500 mt-2">{formatCOP(totalMora)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Total Cartera por Vencer</p>
              <p className="text-3xl font-bold text-amber-500 mt-2">{formatCOP(totalPorVencer)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium">Facturas Pagadas (Histórico)</p>
              <p className="text-3xl font-bold text-teal-500 mt-2">{cxpPagadas.length} Facturas</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
              <span className="text-2xl">✔️</span>
            </div>
          </div>
        </div>

        {/* Tabla de Vencimientos */}
        <section className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Estado de Cuenta Detallado (Obligaciones Activas)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">O.C.</th>
                  <th className="py-4 px-6 font-semibold">Proveedor</th>
                  <th className="py-4 px-6 font-semibold">Fecha Emisión</th>
                  <th className="py-4 px-6 font-semibold">Condición</th>
                  <th className="py-4 px-6 font-semibold">Vencimiento</th>
                  <th className="py-4 px-6 font-semibold">Total a Pagar</th>
                  <th className="py-4 px-6 font-semibold text-center">Estado</th>
                  <th className="py-4 px-6 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {cxpPendientes.length === 0 ? (
                  <tr>
                     <td colSpan={8} className="py-12 text-center text-slate-500">
                       No hay órdenes a crédito pendientes por pagar. ¡Al día! 🎉
                     </td>
                  </tr>
                ) : (
                  cxpPendientes.map((orden) => (
                    <tr key={orden.consecutivo} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{orden.consecutivo}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{orden.proveedor?.razonSocial}</div>
                        <div className="text-xs text-slate-500">NIT: {orden.proveedor?.nit}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                        {parseFechaSegura(orden.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">{orden.proveedor?.formaPago}</td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {orden.fechaVencimiento.toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {formatCOP(orden.totales?.total)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${getSemaforoStyle(orden.semaforo)}`}>
                          {orden.badgeText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => {
                            setDialogConfig({
                              isOpen: true,
                              type: 'confirm',
                              title: 'Confirmar Pago',
                              message: `¿Confirmas el pago de la orden ${orden.consecutivo}?`,
                              onConfirm: () => {
                                actualizarEstadoPagoOrden(orden.consecutivo, 'Pagado');
                                setDialogConfig({ isOpen: false });
                              }
                            });
                          }}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 font-semibold rounded transition-colors text-xs border border-indigo-500/30"
                        >
                          Marcar Pagada ✔️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {cxpPagadas.length > 0 && (
          <details className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            <summary className="p-4 border-b border-slate-700 bg-slate-900/30 cursor-pointer text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              Mostrar Órdenes Pagadas ({cxpPagadas.length})
            </summary>
            <div className="overflow-x-auto opacity-70">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <tbody className="divide-y divide-slate-700/50">
                  {cxpPagadas.map((orden) => (
                    <tr key={orden.consecutivo} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-500">{orden.consecutivo}</td>
                      <td className="py-3 px-6 text-slate-500">{orden.proveedor?.razonSocial}</td>
                      <td className="py-3 px-6 font-mono font-bold text-slate-400">
                        {formatCOP(orden.totales?.total)}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${getSemaforoStyle(orden.semaforo)}`}>
                          {orden.badgeText}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button 
                          onClick={() => actualizarEstadoPagoOrden(orden.consecutivo, 'Pendiente')}
                          className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                          Revertir a Pendiente
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

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

export default CuentasPorPagar;
