import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useOrdenCompra } from '../hooks/useOrdenCompra';
import { OrdenCompraPDF } from './OrdenCompraPDF';

const formatCOP = (valor = 0) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

export const GeneradorOrdenCompra = () => {
  const { proveedorId, setProveedorId, centroCostoId, setCentroCostoId, materiales, agregarMaterial, eliminarMaterial, editarMaterial, totales, requiereAutorizacionSobrecosto, ordenCompleta } = useOrdenCompra();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">PresuPro v2.6</span></div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Generador de Orden de Compra</h1>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block">Consecutivo Asignado</span>
            <span className="font-mono text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block">{ordenCompleta?.consecutivo || 'OC-BORRADOR'}</span>
          </div>
        </header>

        {requiereAutorizacionSobrecosto && (
          <section role="alert" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base">Precios superan el Presupuesto Maestro (APU)</h4>
              <p className="text-xs sm:text-sm text-white/90">Uno o más materiales exceden el precio de referencia aprobado.</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-black/20 text-xs font-semibold uppercase">Vo.Bo. Pendiente</span>
          </section>
        )}

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ID Proveedor</label>
              <input type="text" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ID Centro de Costo / Obra</label>
              <input type="text" value={centroCostoId} onChange={(e) => setCentroCostoId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 pb-4 flex justify-between border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-500 uppercase">Ítems Requeridos</h2>
            <button onClick={agregarMaterial} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100">Agregar Material</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr><th className="py-3 px-4">Código</th><th className="py-3 px-4">Descripción</th><th className="py-3 px-4">Cant</th><th className="py-3 px-4">Vr Unitario</th><th className="py-3 px-4 text-right">Subtotal</th><th className="py-3 px-3"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materiales.map(item => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-4"><input type="text" value={item.codigo || ''} onChange={e => editarMaterial(item.id, 'codigo', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg" /></td>
                    <td className="py-2.5 px-4"><input type="text" value={item.descripcion || ''} onChange={e => editarMaterial(item.id, 'descripcion', e.target.value)} className="w-full px-2 py-1.5 border rounded-lg" /></td>
                    <td className="py-2.5 px-4"><input type="number" value={item.cantidad || ''} onChange={e => editarMaterial(item.id, 'cantidad', Number(e.target.value))} className="w-20 px-2 py-1.5 border rounded-lg" /></td>
                    <td className="py-2.5 px-4"><input type="number" value={item.valorUnitario || ''} onChange={e => editarMaterial(item.id, 'valorUnitario', Number(e.target.value))} className="w-32 px-2 py-1.5 border rounded-lg" /></td>
                    <td className="py-2.5 px-4 text-right">{formatCOP((item.cantidad || 0) * (item.valorUnitario || 0))}</td>
                    <td className="py-2.5 px-3"><button onClick={() => eliminarMaterial(item.id)} className="text-rose-500">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold uppercase text-slate-500 mb-4 pb-2 border-b border-slate-100">Resumen Financiero</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-mono">{formatCOP(totales?.subtotal)}</span></div>
              <div className="flex justify-between"><span>IVA (+):</span><span className="font-mono">{formatCOP(totales?.iva)}</span></div>
              <div className="flex justify-between text-rose-600"><span>ReteFuente (-):</span><span className="font-mono">-{formatCOP(totales?.reteFuente)}</span></div>
              <div className="flex justify-between text-rose-600"><span>ReteICA (-):</span><span className="font-mono">-{formatCOP(totales?.reteICA)}</span></div>
              <div className="flex justify-between text-rose-600"><span>ReteIVA (-):</span><span className="font-mono">-{formatCOP(totales?.reteIVA)}</span></div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t"><span className="font-bold">Total Neto:</span><span className="text-xl font-bold text-emerald-600">{formatCOP(totales?.totalNeto)}</span></div>
            </div>
          </div>
        </section>

        <footer className="pt-4 pb-12 flex justify-end">
          <PDFDownloadLink document={<OrdenCompraPDF orden={ordenCompleta} />} fileName="OrdenCompra.pdf" className="px-6 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800">
            {({ loading }) => (loading ? 'Compilando Documento PDF...' : 'Exportar Orden en PDF')}
          </PDFDownloadLink>
        </footer>
      </div>
    </div>
  );
};
