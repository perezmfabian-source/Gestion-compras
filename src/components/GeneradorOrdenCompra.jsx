import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PDFDownloadLink, PDFViewer, pdf } from '@react-pdf/renderer';
import { useComprasStore } from '../store/useComprasStore';
import { useAuthStore } from '../store/useAuthStore';
import OrdenCompraPDF from './OrdenCompraPDF';
import Dialog from './Dialog';

/**
 * Formateador de moneda para pesos colombianos (COP)
 */
const formatCOP = (valor = 0) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
};

const GeneradorOrdenCompra = () => {
  const tienePermiso = useAuthStore(state => state.tienePermiso);
  const metadatos = useComprasStore((state) => state.metadatos);
  const actualizarMetadatos = useComprasStore((state) => state.actualizarMetadatos);
  const materiales = useComprasStore((state) => state.materiales);
  const agregarMaterial = useComprasStore((state) => state.agregarMaterial);
  const eliminarMaterial = useComprasStore((state) => state.eliminarMaterial);
  const editarMaterial = useComprasStore((state) => state.editarMaterial);
  const requiereAutorizacionSobrecosto = useComprasStore((state) => state.requiereAutorizacionSobrecosto);
  const getTotales = useComprasStore((state) => state.getTotales);
  const totales = getTotales();
  const guardarOrden = useComprasStore((state) => state.guardarOrden);
  const historialOrdenes = useComprasStore((state) => state.historialOrdenes);
  const empresaEmisora = useComprasStore((state) => state.empresaEmisora);
  const actualizarEmpresa = useComprasStore((state) => state.actualizarEmpresa);
  
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });
  const [previewOrden, setPreviewOrden] = useState(null);

  const cargarOrden = useComprasStore((state) => state.cargarOrden);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) {
        setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'El logo debe ser menor a 2MB.', onConfirm: () => setDialogConfig({ isOpen: false }) });
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage.from('logos-empresa').upload(fileName, file, { upsert: true });
      if (error) {
        console.error('Error uploading logo: ', error);
        setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'Fallo al subir el logo.', onConfirm: () => setDialogConfig({ isOpen: false }) });
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('logos-empresa').getPublicUrl(fileName);
      actualizarEmpresa({ logoBase64: publicUrl });
    }
  };

  const handleEnviarCorreo = async (orden) => {
    try {
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Enviando...', message: 'Generando PDF y enviando correo al proveedor. Por favor espera.', onConfirm: () => {} });
      
      const asPdf = pdf();
      asPdf.updateContainer(<OrdenCompraPDF orden={orden} />);
      const blob = await asPdf.toBlob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('enviar-orden-compra', {
          body: {
            to: orden.proveedor.email,
            subject: `Orden de Compra ${orden.consecutivo}`,
            html: `<p>Hola <strong>${orden.proveedor.razonSocial}</strong>,</p><p>Adjunto enviamos la Orden de Compra <strong>${orden.consecutivo}</strong> emitida por nuestra empresa.</p><p>Por favor confirmar de recibido.</p><p>Gracias.</p>`,
            attachments: [
              {
                filename: `Orden_${orden.consecutivo}.pdf`,
                content: base64data
              }
            ]
          }
        });
        
        if (error) throw error;
        
        setDialogConfig({ isOpen: true, type: 'alert', title: 'Éxito', message: 'El correo fue enviado exitosamente desde el servidor.', onConfirm: () => setDialogConfig({ isOpen: false }) });
      };
    } catch (e) {
      console.error(e);
      setDialogConfig({ isOpen: true, type: 'alert', title: 'Error', message: 'No se pudo enviar el correo: ' + e.message, onConfirm: () => setDialogConfig({ isOpen: false }) });
    }
  };

  const ordenCompleta = {
    consecutivo: metadatos.consecutivo || 'OC-000',
    fecha: new Date().toISOString().split('T')[0],
    proveedor: { 
      nit: metadatos.proveedorData?.nit || metadatos.idProveedor, 
      razonSocial: metadatos.proveedorData?.razonSocial || ('PROVEEDOR ' + metadatos.idProveedor),
      email: metadatos.proveedorData?.email || '',
      direccion: metadatos.proveedorData?.direccion || 'N/A',
      telefono: metadatos.proveedorData?.telefono || 'N/A',
      formaPago: metadatos.proveedorData?.formaPago || 'Contado'
    },
    obra: { 
      nombre: metadatos.obraData?.nombre || metadatos.idCentroCosto,
      ciudad: metadatos.obraData?.ciudad || 'N/A'
    },
    items: materiales,
    totales: totales,
    _rawMetadatos: metadatos,
    empresa: useComprasStore.getState().empresaEmisora
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ================= HEADER PRINCIPAL ================= */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
               <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                 PresuPro v2.6
               </span>
               <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                 Módulo de Adquisiciones
               </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Generador de Orden de Compra
            </h1>
          </div>
          <div className="sm:text-right flex flex-col sm:items-end gap-2">
            <div>
              <span className="text-xs text-slate-400 block">Consecutivo Asignado</span>
              <span className="font-mono text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block mb-1">
                {ordenCompleta.consecutivo}
              </span>
              <div className="text-xs text-emerald-600 font-semibold">
                Órdenes en Historial: {historialOrdenes?.length || 0}
              </div>
            </div>
            
            <label className="text-xs text-indigo-600 font-bold bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors inline-flex items-center gap-1.5 shadow-sm mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Insertar Logo Empresa
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {empresaEmisora?.logoBase64 && (
              <span className="text-[10px] text-emerald-500 font-semibold">✓ Logo cargado</span>
            )}
          </div>
        </header>

        {/* ================= ALERTA VISUAL DE SOBRECOSTO ================= */}
        {requiereAutorizacionSobrecosto && (
          <section 
            role="alert" 
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/10 flex items-start sm:items-center justify-between gap-4 animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight">
                  Precios superan el Presupuesto Maestro (APU)
                </h4>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                  Uno o más materiales exceden el precio de referencia aprobado. La orden pasará a flujo de autorización superior.
                </p>
              </div>
            </div>
            <span className="hidden md:inline-flex px-3 py-1 rounded-lg bg-black/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm shrink-0">
              Vo.Bo. Pendiente
            </span>
          </section>
        )}

        {/* ================= SECCIÓN SUPERIOR: DATOS DE CABECERA ================= */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            1. Asignación Fiscal y de Proyecto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="proveedorId" className="block text-sm font-semibold text-slate-700 mb-2">
                ID Proveedor / NIT <span className="text-rose-500">*</span>
              </label>
              <input
                id="proveedorId"
                type="text"
                value={metadatos.idProveedor}
                onChange={(e) => actualizarMetadatos({idProveedor: e.target.value})}
                placeholder="Ej. 891412809"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {metadatos.proveedorData ? (
                <p className="text-xs text-emerald-600 mt-1.5 font-semibold">
                  ✓ {metadatos.proveedorData.razonSocial} ({metadatos.proveedorData.perfilTributario})
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1.5">
                  Define el perfil tributario y tarifas de retención aplicables. (Prueba con: 891412809)
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="centroCostoId" className="block text-sm font-semibold text-slate-700 mb-2">
                  ID Centro de Costo / Obra <span className="text-rose-500">*</span>
                </label>
                <input
                  id="centroCostoId"
                  type="text"
                  value={metadatos.idCentroCosto}
                  onChange={(e) => actualizarMetadatos({idCentroCosto: e.target.value})}
                  placeholder="Ej. CC-101"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {metadatos.obraData ? (
                  <p className="text-xs text-emerald-600 mt-1.5 font-semibold">
                    ✓ {metadatos.obraData.nombre}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1.5">
                    Imputa el costo al APU y determina la territorialidad del ReteICA. (Prueba con: CC-101)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Concepto de Retefuente
                </label>
                <select
                  value={metadatos.conceptoRetencion || ''}
                  onChange={(e) => actualizarMetadatos({ conceptoRetencion: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  {useComprasStore.getState().configTributaria?.conceptosRetefuente?.map(c => (
                    <option key={c.id} value={c.id}>{c.concepto} ({c.porcentaje}%)</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECCIÓN CENTRAL: TABLA DINÁMICA DE MATERIALES ================= */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                2. Ítems y Materiales Requeridos
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ingresa los insumos a contratar para auditar sus precios en tiempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={() => agregarMaterial()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Agregar Material</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-36">Código SKU</th>
                  <th className="py-3 px-4 min-w-[220px]">Descripción</th>
                  <th className="py-3 px-4 w-28 text-center">Cantidad</th>
                  <th className="py-3 px-4 w-40 text-right">Valor Unitario ($)</th>
                  <th className="py-3 px-4 w-36 text-right">Subtotal</th>
                  <th className="py-3 px-3 w-16 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materiales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No hay materiales en la orden. Haz clic en "Agregar Material" para comenzar.
                    </td>
                  </tr>
                ) : (
                  materiales.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={item.codigo || ''}
                          onChange={(e) => editarMaterial(item.id, { codigo: e.target.value })}
                          placeholder="Ej. SKU-001"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={item.descripcion || ''}
                          onChange={(e) => editarMaterial(item.id, { descripcion: e.target.value })}
                          placeholder="Descripción técnica del material"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad || ''}
                          onChange={(e) => editarMaterial(item.id, { cantidad: Number(e.target.value) })}
                          className="w-20 text-center px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.precioUnitario || ''}
                          onChange={(e) => editarMaterial(item.id, { precioUnitario: Number(e.target.value) })}
                          className="w-32 text-right px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-800 text-xs">
                        {formatCOP((item.cantidad || 0) * (item.precioUnitario || 0))}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarMaterial(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar material"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= SECCIÓN INFERIOR: RESUMEN FINANCIERO ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Trazabilidad y Normativa Tributaria</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Los cálculos fiscales respetan los topes de 27 UVT y el cruce automático de regímenes conforme al Estatuto Tributario Nacional. La retención de ICA se aplica de acuerdo con la territorialidad del centro de costos asignado.
              </p>
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>Estructura de salida serializable para Siigo API v1.</span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 pb-2 border-b border-slate-100">
              Resumen de Liquidación
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gravable:</span>
                <span className="font-mono font-medium">{formatCOP(totales?.subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>IVA Liquidado (+):</span>
                <span className="font-mono font-medium text-slate-800">{formatCOP(totales?.iva)}</span>
              </div>

              {/* Deducciones por Retenciones */}
              <div className="pt-2.5 pb-2.5 my-2 border-y border-slate-100 bg-slate-50/70 -mx-6 px-6 space-y-1.5">
                <div className="flex justify-between text-xs text-rose-700">
                  <span>(-) ReteFuente:</span>
                  <span className="font-mono font-medium">-{formatCOP(totales?.retenciones?.retefuente)}</span>
                </div>

                <div className="flex justify-between text-xs text-rose-700">
                  <span>(-) ReteICA:</span>
                  <span className="font-mono font-medium">-{formatCOP(totales?.retenciones?.reteica)}</span>
                </div>

                <div className="flex justify-between text-xs text-rose-700">
                  <span>(-) ReteIVA:</span>
                  <span className="font-mono font-medium">-{formatCOP(totales?.retenciones?.reteiva)}</span>
                </div>
              </div>

              {/* Total Neto Destacado */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-base font-bold text-slate-900 block">Total Neto a Pagar:</span>
                  <span className="text-xs text-slate-400">Giro final programado</span>
                </div>
                <span className="text-2xl font-mono font-extrabold text-emerald-600">
                  {formatCOP(totales?.total)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FOOTER / ACCIONES DE EXPORTACIÓN ================= */}
        <footer className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-200">
          
          <button
            onClick={() => guardarOrden(ordenCompleta)}
            disabled={materiales.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 active:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/15 transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Guardar en Historial PresuPro</span>
          </button>

          <button
            onClick={() => setPreviewOrden(ordenCompleta)}
            disabled={materiales.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 active:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-900/15 transition-all"
          >
            <span className="text-xl">🖨️</span>
            <span>Pre-visualizar / Imprimir (PDF)</span>
          </button>

          <PDFDownloadLink
            document={<OrdenCompraPDF orden={ordenCompleta} />}
            fileName={`Orden_Compra_${ordenCompleta.consecutivo}.pdf`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/15 transition-all"
          >
            {({ loading }) => (
              <>
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{loading ? 'Compilando Documento PDF...' : 'Exportar Orden en PDF'}</span>
              </>
            )}
          </PDFDownloadLink>

          {ordenCompleta.proveedor?.email && (
            <a 
              href={`mailto:${ordenCompleta.proveedor.email}?subject=Orden de Compra ${ordenCompleta.consecutivo}&body=Hola ${ordenCompleta.proveedor.razonSocial},%0D%0A%0D%0AAdjunto enviamos la Orden de Compra ${ordenCompleta.consecutivo}. Por favor confirmar de recibido.%0D%0A%0D%0AGracias.`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-900/15 transition-all"
            >
              <span className="text-xl">📧</span>
              <span>Enviar al Proveedor</span>
            </a>
          )}
        </footer>

        {/* ================= SECCIÓN HISTORIAL DE ÓRDENES ================= */}
        {historialOrdenes && historialOrdenes.length > 0 && (
          <section className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Historial de Órdenes Guardadas
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Consulta y vuelve a descargar las órdenes que ya fueron procesadas e integradas al sistema.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Consecutivo</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Proveedor</th>
                    <th className="py-3 px-4">Centro de Costo</th>
                    <th className="py-3 px-4">Pago</th>
                    <th className="py-3 px-4 text-right">Total Neto</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historialOrdenes.map((orden, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{orden.consecutivo}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{orden.fecha}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{orden.proveedor?.razonSocial}</div>
                        <div className="text-xs text-slate-400">NIT: {orden.proveedor?.nit}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-xs">{orden.obra?.nombre}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${orden.proveedor?.formaPago?.toLowerCase().includes('contado') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {orden.proveedor?.formaPago || 'Contado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatCOP(orden.totales?.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              cargarOrden(orden);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            title="Editar Orden"
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {tienePermiso('ordenes.eliminar') && (
                            <button
                              onClick={() => {
                                setDialogConfig({
                                  isOpen: true,
                                  type: 'confirm',
                                  title: 'Eliminar Orden',
                                  message: `¿Seguro que deseas borrar la orden ${orden.consecutivo}?`,
                                  onConfirm: () => {
                                    useComprasStore.getState().eliminarOrden(orden.consecutivo);
                                    setDialogConfig({ isOpen: false });
                                  }
                                });
                              }}
                              title="Borrar Orden"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          
                          <button
                            onClick={() => setPreviewOrden(orden)}
                            title="Pre-visualizar PDF"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <PDFDownloadLink
                            document={<OrdenCompraPDF orden={orden} />}
                            fileName={`Orden_Compra_${orden.consecutivo}.pdf`}
                            title="Descargar PDF"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            {({ loading }) => (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                          </PDFDownloadLink>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>

      {previewOrden && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
              <h3 className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">🖨️</span>
                Pre-visualización de Impresión - {previewOrden.consecutivo}
              </h3>
              <div className="flex items-center gap-4">
                {previewOrden.proveedor?.email && (
                  <a 
                    href={`mailto:${previewOrden.proveedor.email}?subject=Orden de Compra ${previewOrden.consecutivo}&body=Hola ${previewOrden.proveedor.razonSocial},%0D%0A%0D%0AAdjunto enviamos la Orden de Compra ${previewOrden.consecutivo}. Por favor confirmar de recibido.%0D%0A%0D%0AGracias.`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>📧</span> Enviar al Proveedor
                  </a>
                )}
                <button onClick={() => setPreviewOrden(null)} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-950 p-4">
              <PDFViewer width="100%" height="100%" className="border-0 rounded shadow-lg">
                <OrdenCompraPDF orden={previewOrden} />
              </PDFViewer>
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

export default GeneradorOrdenCompra;

