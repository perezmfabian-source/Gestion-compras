import { useState, useMemo } from 'react';

const BASE_MINIMA_RETENCION = 1411803; 

const CATALOGO_MATERIALES = [
  { codigo: 'CEM-GRIS-50KG', descripcion: 'Cemento Gris Uso General 50kg', unidad: 'BTO', precioReferenciaAprobado: 28000, tarifaIVA: 19 },
  { codigo: 'ACERO-W60-12', descripcion: 'Varilla Corrugada 1/2" Grado 60 6m', unidad: 'VAR', precioReferenciaAprobado: 42500, tarifaIVA: 19 },
  { codigo: 'ARENA-RIO-M3', descripcion: 'Arena Fina de Río Lavada', unidad: 'M3', precioReferenciaAprobado: 65000, tarifaIVA: 0 },
];

const PROVEEDORES_DB = {
  '860000210': { razonSocial: 'CEMEX COLOMBIA S.A.', nit: '860000210', dv: '3', perfilTributario: 'GRAN_CONTRIBUYENTE', esAutorretenedor: true, tarifaICA: 6.9, direccion: { linea: 'Calle 100 # 7-33', ciudad: 'Bogotá' }, telefono: '6013004000' },
  '900543210': { razonSocial: 'DISTRIBUIDORA DE HIERROS Y ACEROS SAS', nit: '900543210', dv: '8', perfilTributario: 'REGIMEN_COMUN', esAutorretenedor: false, tarifaICA: 9.66, direccion: { linea: 'Av. Américas # 42-10', ciudad: 'Bogotá' }, telefono: '6017894561' },
};

export const useOrdenCompra = () => {
  const [proveedorId, setProveedorId] = useState('900543210');
  const [centroCostoId, setCentroCostoId] = useState('CC-101');
  const [materiales, setMateriales] = useState([
    { id: 'item-1', codigo: 'CEM-GRIS-50KG', descripcion: 'Cemento Gris Uso General 50kg', unidad: 'BTO', cantidad: 100, valorUnitario: 28000, precioReferenciaAprobado: 28000, tarifaIVA: 19 },
  ]);

  const agregarMaterial = () => {
    const defaultMat = CATALOGO_MATERIALES[0];
    setMateriales(prev => [...prev, { id: `item-${Date.now()}`, ...defaultMat, cantidad: 1, valorUnitario: defaultMat.precioReferenciaAprobado }]);
  };

  const eliminarMaterial = (id) => setMateriales(prev => prev.filter(item => item.id !== id));

  const editarMaterial = (id, campo, valor) => {
    setMateriales(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (campo === 'codigo') {
        const match = CATALOGO_MATERIALES.find(m => m.codigo.toLowerCase() === String(valor).toLowerCase());
        if (match) return { ...item, ...match, valorUnitario: match.precioReferenciaAprobado };
      }
      return { ...item, [campo]: valor };
    }));
  };

  const requiereAutorizacionSobrecosto = useMemo(() => {
    return materiales.some(m => (Number(m.precioReferenciaAprobado) || 0) > 0 && (Number(m.valorUnitario) || 0) > (Number(m.precioReferenciaAprobado) || 0));
  }, [materiales]);

  const totales = useMemo(() => {
    let subtotal = 0, iva = 0;
    materiales.forEach(m => {
      const subtLinea = (Number(m.cantidad) || 0) * (Number(m.valorUnitario) || 0);
      subtotal += subtLinea;
      iva += subtLinea * ((Number(m.tarifaIVA) || 0) / 100);
    });

    const superaBaseMinima = subtotal >= BASE_MINIMA_RETENCION;
    const prov = PROVEEDORES_DB[proveedorId] || { perfilTributario: 'REGIMEN_COMUN', esAutorretenedor: false, tarifaICA: 9.66 };

    const reteFuente = superaBaseMinima && !prov.esAutorretenedor && prov.perfilTributario !== 'REGIMEN_SIMPLE' ? Math.round(subtotal * 0.025) : 0;
    const reteICA = superaBaseMinima && !prov.esAutorretenedor && prov.tarifaICA > 0 ? Math.round(subtotal * (prov.tarifaICA / 1000)) : 0;
    const reteIVA = 0;
    const totalRetenciones = reteFuente + reteICA + reteIVA;
    
    return { subtotal, iva, reteFuente, reteICA, reteIVA, totalRetenciones, totalNeto: subtotal + iva - totalRetenciones };
  }, [materiales, proveedorId]);

  const ordenCompleta = useMemo(() => {
    const prov = PROVEEDORES_DB[proveedorId] || { razonSocial: 'PROVEEDOR GENERAL', nit: proveedorId, dv: '0' };
    return {
      consecutivo: 'OC-2026-0042',
      fechaEmision: new Date().toISOString().split('T')[0],
      proveedorSnapshot: prov,
      centroCosto: { codigo: centroCostoId, nombre: `Centro de Costo ${centroCostoId}` },
      items: materiales.map(m => {
        const subtotalNeto = (Number(m.cantidad) || 0) * (Number(m.valorUnitario) || 0);
        return {
          sku: m.codigo, descripcion: m.descripcion, unidad: m.unidad || 'UND',
          cantidad: Number(m.cantidad) || 0, precioUnitario: Number(m.valorUnitario) || 0,
          subtotalNeto, montoIVA: subtotalNeto * ((Number(m.tarifaIVA) || 0) / 100),
        };
      }),
      resumenFinanciero: {
        subtotal: totales.subtotal, ivaTotal: totales.iva,
        montoReteFuente: totales.reteFuente, montoReteICA: totales.reteICA,
        montoReteIVA: totales.reteIVA, totalNeto: totales.totalNeto,
      },
    };
  }, [proveedorId, centroCostoId, materiales, totales]);

  return { proveedorId, setProveedorId, centroCostoId, setCentroCostoId, materiales, agregarMaterial, eliminarMaterial, editarMaterial, totales, requiereAutorizacionSobrecosto, ordenCompleta };
};

export default useOrdenCompra;
