import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calcularRetenciones } from '../utils/calcularRetenciones';
import { MAESTRO_MATERIALES, MAESTRO_OBRAS, MAESTRO_PROVEEDORES } from '../utils/mockDB';

const IVA_TASA = 0.19;

const METADATOS_INICIALES = {
  idProveedor: '',
  idCentroCosto: '',
  proveedorData: null,
  obraData: null,
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
      // --- ESTADO LOCAL DE LA ORDEN EN CURSO ---
      metadatos: METADATOS_INICIALES,
      materiales: [],
      requiereAutorizacionSobrecosto: false,
      
      // --- HISTORIAL DE ÓRDENES (PRESUPRO INTEGRATION) ---
      historialOrdenes: [],

      // --- ACCIONES DE FORMULARIO ---
      actualizarMetadatos: (campos) => set((state) => {
        const nuevo = { ...state.metadatos, ...campos };
        
        // Auto-completar proveedor desde el Maestro (Simulación de DB PresuPro)
        if (campos.idProveedor && MAESTRO_PROVEEDORES[campos.idProveedor]) {
          nuevo.proveedorData = MAESTRO_PROVEEDORES[campos.idProveedor];
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
        const retenciones = calcularRetenciones({
          subtotal,
          iva,
          perfilProveedor: state.metadatos.proveedorData?.perfilTributario || 'Regimen Comun',
          tarifaIca: state.metadatos.obraData?.tarifaIca || 0.00696
        });
        const totalRetenciones = aNumero(retenciones.totalRetenciones);
        const total = subtotal + iva - totalRetenciones;

        return { subtotal, iva, retenciones, totalRetenciones, total };
      },

      // --- FLUJO DE GUARDADO (INTEGRACIÓN) ---
      guardarOrden: (ordenJSON) => set((state) => {
        return {
          historialOrdenes: [ordenJSON, ...(state.historialOrdenes || [])],
          metadatos: METADATOS_INICIALES,
          materiales: [],
          requiereAutorizacionSobrecosto: false
        };
      }),

    }),
    {
      name: 'presupro-compras-storage', // persite en localStorage
      partialize: (state) => ({ historialOrdenes: state.historialOrdenes }), // Solo persiste el historial, no los borradores
    }
  )
);
