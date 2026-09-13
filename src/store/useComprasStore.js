import { create } from 'zustand';
import { calcularRetenciones } from '../utils/calcularRetenciones';
import { MAESTRO_MATERIALES, MAESTRO_OBRAS, MAESTRO_PROVEEDORES } from '../utils/mockDB';
import { supabase } from '../lib/supabaseClient';

const IVA_TASA = 0.19;

const METADATOS_INICIALES = {
  consecutivo: 'OC-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
  idProveedor: '',
  idCentroCosto: '',
  proveedorData: null,
  obraData: null,
  conceptoRetencion: 1,
};

const crearId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `mat-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const aNumero = (valor) => {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
};

const itemTieneSobrecosto = (item) => {
  const precio = aNumero(item.precioUnitario);
  const referencia = aNumero(item.precioReferencia);
  return referencia > 0 && precio > referencia;
};

export const useComprasStore = create((set, get) => ({
  // --- CONFIGURACIÓN DE LA EMPRESA EMISORA ---
  empresaEmisora: {
    nombre: 'BUSTILLO INGENIERIA SAS',
    nit: '900.000.000-1',
    direccion: 'Barrio Bellavista Cra 56 B 7A-45',
  },

  actualizarEmpresa: (datos) => set((state) => ({
    empresaEmisora: { ...state.empresaEmisora, ...datos }
  })),

  // --- ESTADO LOCAL DE LA ORDEN EN CURSO ---
  metadatos: { ...METADATOS_INICIALES, consecutivo: 'OC-001' },
  materiales: [],
  requiereAutorizacionSobrecosto: false,
  
  // --- HISTORIAL ---
  historialOrdenes: [],
  entradasAlmacen: [],
  proveedores: Object.values(MAESTRO_PROVEEDORES),
  facturasCausadas: [],

  // --- KARDEX E INVENTARIO ---
  inventario: [],
  movimientosInventario: [],

  isInitialized: false,

  initStore: async () => {
    try {
      // Intentar cargar datos de Supabase si existen
      const [provRes, ordRes, invRes, configRes] = await Promise.all([
        supabase.from('proveedores').select('*'),
        supabase.from('ordenes_compra').select('*'),
        supabase.from('inventario').select('*'),
        supabase.from('configuracion').select('datos').eq('id', 'tributaria').single()
      ]);

      if (!provRes.error && provRes.data && provRes.data.length > 0) {
        set({ proveedores: provRes.data.map(p => ({
          nit: p.nit,
          razonSocial: p.razon_social,
          direccion: p.direccion,
          ciudad: p.ciudad,
          telefono: p.telefono,
          celular: p.celular,
          vendedor: p.vendedor,
          perfilTributario: p.perfil_tributario,
          actividad: p.actividad_economica,
          formaPago: p.forma_pago
        })) });
      }

      if (!ordRes.error && ordRes.data && ordRes.data.length > 0) {
        set({ historialOrdenes: ordRes.data.map(o => ({
          consecutivo: o.consecutivo,
          fecha: o.fecha,
          estadoPago: o.estado_pago,
          proveedor: { nit: o.proveedor_nit },
          obra: { nombre: o.centro_costo_id },
          totales: { total: o.total_neto },
          _rawMetadatos: o.raw_metadatos || {}
        })) });
      }

      if (!configRes.error && configRes.data) {
        set({ configTributaria: configRes.data.datos });
      }

      set({ isInitialized: true });
    } catch (err) {
      console.warn("Fallo cargando datos de Supabase. Iniciado con DB local.", err);
      set({ isInitialized: true });
    }
  },

  registrarMovimientoInventario: async (movimiento) => {
    const nuevoMov = { ...movimiento, idMovimiento: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`, fecha: new Date().toISOString() };
    
    // Optimistic update
    set((state) => {
      let nuevoInventario = [...state.inventario];
      let itemIndex = nuevoInventario.findIndex(i => i.sku === movimiento.sku || i.descripcion === movimiento.descripcion);

      let itemActual = itemIndex >= 0 ? { ...nuevoInventario[itemIndex] } : {
        id: `INV-${Date.now()}`,
        sku: movimiento.sku || `SKU-${Date.now().toString().slice(-4)}`,
        descripcion: movimiento.descripcion,
        unidad: movimiento.unidad,
        entradas: 0,
        salidas: 0,
        saldo: 0,
        costoPromedio: 0,
        valorTotal: 0
      };

      const qty = Number(movimiento.cantidad) || 0;
      const cstUnit = Number(movimiento.costoUnitario) || 0;

      if (movimiento.tipo === 'ENTRADA') {
        const valorActual = itemActual.saldo * itemActual.costoPromedio;
        const valorNuevo = qty * cstUnit;
        
        itemActual.entradas += qty;
        itemActual.saldo += qty;
        
        if (itemActual.saldo > 0) {
          itemActual.costoPromedio = (valorActual + valorNuevo) / itemActual.saldo;
        }
        itemActual.valorTotal = itemActual.saldo * itemActual.costoPromedio;
      } else if (movimiento.tipo === 'SALIDA') {
        itemActual.salidas += qty;
        itemActual.saldo -= qty;
        itemActual.valorTotal = itemActual.saldo * itemActual.costoPromedio;
      }

      if (itemIndex >= 0) {
        nuevoInventario[itemIndex] = itemActual;
      } else {
        nuevoInventario.push(itemActual);
      }

      return {
        inventario: nuevoInventario,
        movimientosInventario: [nuevoMov, ...state.movimientosInventario]
      };
    });

    // Supabase update
    try {
       // Si usamos la BD real, esto requeriría UPSERT en inventario y INSERT en movimientos.
       // Se deja listo para usar supabase client cuando configuren la bd
       await supabase.from('movimientos_inventario').insert([{
         id_movimiento: nuevoMov.idMovimiento,
         tipo: nuevoMov.tipo,
         sku: nuevoMov.sku,
         cantidad: nuevoMov.cantidad,
         costo_unitario: nuevoMov.costoUnitario,
         referencia: nuevoMov.referencia,
         responsable: nuevoMov.responsable
       }]);
    } catch(e) {}
  },

  causarFactura: async (factura) => {
    const nueva = { ...factura, idFacturaInterno: Date.now().toString() };
    set((state) => ({ facturasCausadas: [...state.facturasCausadas, nueva] }));

    try {
      await supabase.from('facturas_causadas').insert([{
        id_factura_interno: nueva.idFacturaInterno,
        orden_consecutivo: nueva.ordenConsecutivo,
        numero_factura: nueva.numeroFactura,
        monto_total: nueva.montoTotal
      }]);
    } catch(e) {}
  },

  eliminarFacturaCausada: async (idInterno) => {
    set((state) => ({
      facturasCausadas: state.facturasCausadas.filter(f => f.idFacturaInterno !== idInterno)
    }));
    try {
      await supabase.from('facturas_causadas').delete().eq('id_factura_interno', idInterno);
    } catch(e) {}
  },

  configTributaria: {
    uvt: 52289,
    conceptosRetefuente: [
      { id: 1, concepto: 'Compras generales (declarantes)', baseUvt: 27, porcentaje: 2.5 },
      { id: 2, concepto: 'Compras generales (no declarantes)', baseUvt: 27, porcentaje: 3.5 },
      { id: 3, concepto: 'Servicios generales (declarantes)', baseUvt: 4, porcentaje: 4.0 },
      { id: 4, concepto: 'Servicios generales (no declarantes)', baseUvt: 4, porcentaje: 6.0 },
      { id: 5, concepto: 'Honorarios y comisiones (personas jurídicas)', baseUvt: 0, porcentaje: 11.0 },
      { id: 6, concepto: 'Honorarios y comisiones (personas naturales)', baseUvt: 0, porcentaje: 10.0 },
      { id: 7, concepto: 'Servicios de transporte de carga', baseUvt: 4, porcentaje: 1.0 },
      { id: 8, concepto: 'Contratos de construcción y urbanización', baseUvt: 27, porcentaje: 2.0 },
      { id: 9, concepto: 'Arrendamiento de bienes muebles', baseUvt: 0, porcentaje: 4.0 },
      { id: 10, concepto: 'Arrendamiento de bienes inmuebles (declarantes)', baseUvt: 27, porcentaje: 3.5 },
      { id: 11, concepto: 'Servicios de hoteles y restaurantes', baseUvt: 4, porcentaje: 3.5 },
      { id: 12, concepto: 'Servicios prestados por empresas de vigilancia y aseo', baseUvt: 4, porcentaje: 2.0 },
    ],
    tarifasIca: [
      { id: 1, ciudad: 'CARTAGENA', actividad: 'Obras Civiles', tarifa: '9.66', estado: 'Activo' },
      { id: 2, ciudad: 'MONTELIBANO', actividad: 'Servicios de Ingeniería', tarifa: '6.96', estado: 'Activo' },
      { id: 3, ciudad: 'BARRANQUILLA', actividad: 'Suministros', tarifa: '10.00', estado: 'Activo' },
    ]
  },
  actualizarConfigTributaria: async (nuevaConfig) => {
    const estadoActual = get().configTributaria;
    const configActualizada = { ...estadoActual, ...nuevaConfig };
    
    set({ configTributaria: configActualizada });

    try {
      await supabase.from('configuracion').upsert([
        { id: 'tributaria', datos: configActualizada }
      ], { onConflict: 'id' });
    } catch(e) {
      console.error("Error guardando config tributaria", e);
    }
  },

  // --- ACCIONES DE PROVEEDORES ---
  guardarProveedor: async (proveedor) => {
    set((state) => {
      const existe = state.proveedores.find(p => p.nit === proveedor.nit);
      if (existe) {
        return { proveedores: state.proveedores.map(p => p.nit === proveedor.nit ? proveedor : p) };
      }
      return { proveedores: [...state.proveedores, proveedor] };
    });

    try {
      const { error } = await supabase.from('proveedores').upsert([{
        nit: proveedor.nit,
        razon_social: proveedor.razonSocial,
        direccion: proveedor.direccion,
        ciudad: proveedor.ciudad,
        telefono: proveedor.telefono,
        celular: proveedor.celular,
        vendedor: proveedor.vendedor,
        perfil_tributario: proveedor.perfilTributario,
        actividad_economica: proveedor.actividad,
        forma_pago: proveedor.formaPago
      }], { onConflict: 'nit' });
      if (error) console.error("Error guardando proveedor:", error);
    } catch(e) {
      console.error("Excepción guardando proveedor:", e);
    }
  },

  eliminarProveedor: async (nit) => {
    set((state) => ({
      proveedores: state.proveedores.filter(p => p.nit !== nit)
    }));
    try {
      await supabase.from('proveedores').delete().eq('nit', nit);
    } catch(e) {}
  },

  // --- ACCIONES DE FORMULARIO ---
  actualizarMetadatos: (campos) => set((state) => {
    const nuevo = { ...state.metadatos, ...campos };
    if (campos.idProveedor) {
      const provEncontrado = state.proveedores.find(p => 
        p.nit.replace(/\D/g, '') === campos.idProveedor || p.nit === campos.idProveedor
      );
      nuevo.proveedorData = provEncontrado || null;
    } else if (campos.idProveedor !== undefined) {
      nuevo.proveedorData = null;
    }
    if (campos.idCentroCosto && MAESTRO_OBRAS[campos.idCentroCosto]) {
      nuevo.obraData = MAESTRO_OBRAS[campos.idCentroCosto];
    } else if (campos.idCentroCosto !== undefined) {
      nuevo.obraData = null;
    }
    return { metadatos: nuevo };
  }),

  agregarMaterial: (overrides = {}) => set((state) => {
    const idMaterial = overrides.idMaterial ?? '';
    const nuevoItem = {
      id: crearId(),
      codigo: idMaterial,
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      precioReferencia: 0,
      sobrecosto: false,
      ...overrides,
    };
    return { materiales: [...state.materiales, nuevoItem] };
  }),

  editarMaterial: (id, campos) => set((state) => {
    const materialesActualizados = state.materiales.map((item) => {
      if (item.id !== id) return item;
      const actualizado = { ...item, ...campos };
      if (campos.codigo && MAESTRO_MATERIALES[campos.codigo]) {
        const mat = MAESTRO_MATERIALES[campos.codigo];
        actualizado.descripcion = mat.descripcion;
        actualizado.precioUnitario = mat.precioReferencia;
        actualizado.precioReferencia = mat.precioReferencia;
      }
      actualizado.sobrecosto = itemTieneSobrecosto(actualizado);
      return actualizado;
    });
    const haySobrecosto = materialesActualizados.some((item) => item.sobrecosto);
    return { materiales: materialesActualizados, requiereAutorizacionSobrecosto: haySobrecosto };
  }),

  eliminarMaterial: (id) => set((state) => {
    const nuevosMateriales = state.materiales.filter((item) => item.id !== id);
    const haySobrecosto = nuevosMateriales.some((item) => item.sobrecosto);
    return { materiales: nuevosMateriales, requiereAutorizacionSobrecosto: haySobrecosto };
  }),

  getTotales: () => {
    const state = get();
    const subtotal = state.materiales.reduce(
      (acc, item) => acc + aNumero(item.cantidad) * aNumero(item.precioUnitario),
      0
    );
    const iva = subtotal * IVA_TASA;
    const ciudadObra = (state.metadatos.obraData?.ciudad || '').toUpperCase();
    const tarifaEncontrada = state.configTributaria.tarifasIca.find(t => t.ciudad.toUpperCase() === ciudadObra);
    const tarifaIca = tarifaEncontrada ? (Number(tarifaEncontrada.tarifa) / 1000) : (state.metadatos.obraData?.tarifaIca || 0.00696);
    const conceptoIdSeleccionado = Number(state.metadatos.conceptoRetencion || 1);
    let conceptoRetefuente = state.configTributaria.conceptosRetefuente.find(c => c.id === conceptoIdSeleccionado);
    if (!conceptoRetefuente && state.configTributaria.conceptosRetefuente.length > 0) {
      conceptoRetefuente = state.configTributaria.conceptosRetefuente[0];
    }
    const retenciones = calcularRetenciones({
      subtotal,
      iva,
      perfilProveedor: state.metadatos.proveedorData?.perfilTributario || 'Regimen Comun',
      tarifaIca,
      uvtActual: state.configTributaria.uvt,
      conceptoRetefuente
    });
    const totalRetenciones = aNumero(retenciones.totalRetenciones);
    const total = subtotal + iva - totalRetenciones;
    return { subtotal, iva, retenciones, totalRetenciones, total };
  },

  guardarOrden: async (ordenJSON) => {
    let nextConsecutivo;
    
    set((state) => {
      const historial = state.historialOrdenes || [];
      const existe = historial.some(o => o.consecutivo === ordenJSON.consecutivo);
      let nuevoHistorial;
      
      if (existe) {
        nuevoHistorial = historial.map(o => o.consecutivo === ordenJSON.consecutivo ? ordenJSON : o);
      } else {
        nuevoHistorial = [ordenJSON, ...historial];
      }

      const maxNum = nuevoHistorial.reduce((max, o) => {
        const num = parseInt(o.consecutivo.replace(/\D/g, ''), 10) || 0;
        return num > max ? num : max;
      }, 0);
      nextConsecutivo = 'OC-' + (maxNum + 1).toString().padStart(3, '0');

      return {
        historialOrdenes: nuevoHistorial,
        metadatos: { ...METADATOS_INICIALES, consecutivo: nextConsecutivo },
        materiales: [],
        requiereAutorizacionSobrecosto: false
      };
    });

    try {
      await supabase.from('ordenes_compra').upsert([{
        consecutivo: ordenJSON.consecutivo,
        fecha: ordenJSON.fecha,
        estado_pago: ordenJSON.estadoPago || 'Pendiente',
        proveedor_nit: ordenJSON.proveedor?.nit,
        centro_costo_id: ordenJSON.obra?.nombre,
        subtotal: ordenJSON.totales?.subtotal,
        iva: ordenJSON.totales?.iva,
        retefuente: ordenJSON.totales?.retenciones?.retefuente,
        reteica: ordenJSON.totales?.retenciones?.reteica,
        reteiva: ordenJSON.totales?.retenciones?.reteiva,
        total_neto: ordenJSON.totales?.total,
        raw_metadatos: ordenJSON._rawMetadatos
      }], { onConflict: 'consecutivo' });
    } catch(e) {}
  },

  cargarOrden: (ordenJSON) => set((state) => ({
    metadatos: ordenJSON._rawMetadatos || METADATOS_INICIALES,
    materiales: ordenJSON.items || [],
    requiereAutorizacionSobrecosto: (ordenJSON.items || []).some(itemTieneSobrecosto)
  })),

  actualizarEstadoPagoOrden: async (consecutivo, nuevoEstado) => {
    set((state) => ({
      historialOrdenes: state.historialOrdenes.map(o => 
        o.consecutivo === consecutivo ? { ...o, estadoPago: nuevoEstado } : o
      )
    }));
    try {
      await supabase.from('ordenes_compra')
        .update({ estado_pago: nuevoEstado })
        .eq('consecutivo', consecutivo);
    } catch(e) {}
  },

  registrarEntradaAlmacen: async (nuevaEntrada) => {
    const registrarKardex = get().registrarMovimientoInventario;
    nuevaEntrada.items.forEach(item => {
      registrarKardex({
        tipo: 'ENTRADA',
        sku: item.codigo || '',
        descripcion: item.descripcion,
        unidad: item.unidad,
        cantidad: item.cantidadRecibida,
        costoUnitario: item.precioUnitario || 0,
        referencia: nuevaEntrada.ordenConsecutivo,
        responsable: nuevaEntrada.recepcionista || 'Almacén'
      });
    });

    const entradaAguardar = { ...nuevaEntrada, idEntrada: `ENT-${Date.now()}`, fechaRecepcion: new Date().toISOString() };
    
    set((state) => ({
      entradasAlmacen: [entradaAguardar, ...state.entradasAlmacen]
    }));

    try {
      await supabase.from('entradas_almacen').insert([{
        id_entrada: entradaAguardar.idEntrada,
        orden_consecutivo: entradaAguardar.ordenConsecutivo,
        fecha_recepcion: entradaAguardar.fechaRecepcion,
        recepcionista: entradaAguardar.recepcionista,
        notas: entradaAguardar.notas,
        items: entradaAguardar.items
      }]);
    } catch(e) {}
  },
  
  eliminarOrden: async (consecutivo) => {
    set((state) => ({
      historialOrdenes: state.historialOrdenes.filter(o => o.consecutivo !== consecutivo)
    }));
    try {
      await supabase.from('ordenes_compra').delete().eq('consecutivo', consecutivo);
    } catch(e) {}
  },

}));
