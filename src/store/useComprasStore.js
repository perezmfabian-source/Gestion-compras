import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calcularRetenciones } from '../utils/calcularRetenciones';
import { MAESTRO_MATERIALES, MAESTRO_OBRAS, MAESTRO_PROVEEDORES } from '../utils/mockDB';

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

export const useComprasStore = create(
  persist(
    (set, get) => ({
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
      
      // --- HISTORIAL DE ÓRDENES Y PROVEEDORES (PRESUPRO INTEGRATION) ---
      historialOrdenes: [],
      proveedores: Object.values(MAESTRO_PROVEEDORES),

      // --- CONFIGURACIÓN TRIBUTARIA GLOBAL ---
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
      actualizarConfigTributaria: (nuevaConfig) => set((state) => ({
        configTributaria: { ...state.configTributaria, ...nuevaConfig }
      })),

      // --- ACCIONES DE PROVEEDORES ---
      guardarProveedor: (proveedor) => set((state) => {
        const existe = state.proveedores.find(p => p.nit === proveedor.nit);
        if (existe) {
          return {
            proveedores: state.proveedores.map(p => p.nit === proveedor.nit ? proveedor : p)
          };
        }
        return {
          proveedores: [...state.proveedores, proveedor]
        };
      }),
      eliminarProveedor: (nit) => set((state) => ({
        proveedores: state.proveedores.filter(p => p.nit !== nit)
      })),

      // --- ACCIONES DE FORMULARIO ---
      actualizarMetadatos: (campos) => set((state) => {
        const nuevo = { ...state.metadatos, ...campos };
        
        // Auto-completar proveedor desde el Estado Global (CRM)
        if (campos.idProveedor) {
          const provEncontrado = state.proveedores.find(p => 
            p.nit.replace(/\D/g, '') === campos.idProveedor || p.nit === campos.idProveedor
          );
          nuevo.proveedorData = provEncontrado || null;
        } else if (campos.idProveedor !== undefined) {
          nuevo.proveedorData = null;
        }

        // Auto-completar obra
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

          // Auto-completar precios desde el catálogo maestro
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

        return { 
          materiales: materialesActualizados,
          requiereAutorizacionSobrecosto: haySobrecosto
        };
      }),

      eliminarMaterial: (id) => set((state) => {
        const nuevosMateriales = state.materiales.filter((item) => item.id !== id);
        const haySobrecosto = nuevosMateriales.some((item) => item.sobrecosto);
        return { 
          materiales: nuevosMateriales,
          requiereAutorizacionSobrecosto: haySobrecosto
        };
      }),

      // --- DERIVADOS (GETTERS) ---
      getTotales: () => {
        const state = get();
        const subtotal = state.materiales.reduce(
          (acc, item) => acc + aNumero(item.cantidad) * aNumero(item.precioUnitario),
          0
        );
        const iva = subtotal * IVA_TASA;
        
        // Buscar tarifa ICA dinámica basada en la ciudad de la obra seleccionada
        const ciudadObra = (state.metadatos.obraData?.ciudad || '').toUpperCase();
        const tarifaEncontrada = state.configTributaria.tarifasIca.find(t => t.ciudad.toUpperCase() === ciudadObra);
        const tarifaIca = tarifaEncontrada ? (Number(tarifaEncontrada.tarifa) / 1000) : (state.metadatos.obraData?.tarifaIca || 0.00696);

        // Buscar concepto de retención seleccionado o usar el primero por defecto
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

      // --- FLUJO DE GUARDADO Y EDICIÓN (INTEGRACIÓN) ---
      guardarOrden: (ordenJSON) => set((state) => {
        // Generar consecutivo real de manera secuencial si es nueva (no existe)
        const historial = state.historialOrdenes || [];
        const existe = historial.some(o => o.consecutivo === ordenJSON.consecutivo);
        let nuevoHistorial;
        
        if (existe) {
          nuevoHistorial = historial.map(o => 
            o.consecutivo === ordenJSON.consecutivo ? ordenJSON : o
          );
        } else {
          // Si no existía, asegurar que tenga el número correcto
          nuevoHistorial = [ordenJSON, ...historial];
        }

        // Calcular el próximo consecutivo secuencial
        const maxNum = nuevoHistorial.reduce((max, o) => {
          const num = parseInt(o.consecutivo.replace(/\D/g, ''), 10) || 0;
          return num > max ? num : max;
        }, 0);
        const nextConsecutivo = 'OC-' + (maxNum + 1).toString().padStart(3, '0');

        return {
          historialOrdenes: nuevoHistorial,
          metadatos: {
            ...METADATOS_INICIALES,
            consecutivo: nextConsecutivo
          },
          materiales: [],
          requiereAutorizacionSobrecosto: false
        };
      }),

      cargarOrden: (ordenJSON) => set((state) => {
        return {
          metadatos: ordenJSON._rawMetadatos || METADATOS_INICIALES,
          materiales: ordenJSON.items || [],
          requiereAutorizacionSobrecosto: ordenJSON.items.some(itemTieneSobrecosto)
        };
      }),

      actualizarEstadoPagoOrden: (consecutivo, nuevoEstado) => set((state) => ({
        historialOrdenes: state.historialOrdenes.map(o => 
          o.consecutivo === consecutivo ? { ...o, estadoPago: nuevoEstado } : o
        )
      })),

      registrarEntradaAlmacen: (nuevaEntrada) => set((state) => {
        const entradasActualizadas = [
          { ...nuevaEntrada, idEntrada: `ENT-${Date.now()}`, fechaRecepcion: new Date().toISOString() },
          ...state.entradasAlmacen
        ];

        return {
          entradasAlmacen: entradasActualizadas
        };
      }),
      
      eliminarOrden: (consecutivo) => set((state) => {
        return {
          historialOrdenes: state.historialOrdenes.filter(o => o.consecutivo !== consecutivo)
        };
      }),

    }),
    {
      name: 'presupro-compras-storage', // persite en localStorage
      partialize: (state) => ({ 
        historialOrdenes: state.historialOrdenes,
        proveedores: state.proveedores,
        empresaEmisora: state.empresaEmisora,
        configTributaria: state.configTributaria,
        // Guardar también el último consecutivo activo en el borrador si queremos
        metadatos: { ...METADATOS_INICIALES, consecutivo: state.metadatos.consecutivo }
      }), 
    }
  )
);
