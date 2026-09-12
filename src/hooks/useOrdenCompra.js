import { useCallback, useEffect, useMemo, useState } from 'react'
import { calcularRetenciones } from '../utils/calcularRetenciones'
import { MAESTRO_MATERIALES, MAESTRO_OBRAS, MAESTRO_PROVEEDORES } from '../utils/mockDB'

const IVA_TASA = 0.19

const METADATOS_INICIALES = {
  idProveedor: '',
  idCentroCosto: '',
}

const crearId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `mat-${Date.now()}-${Math.random().toString(16).slice(2)}`

const aNumero = (valor) => {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

const crearMaterial = (overrides = {}, preciosMaestro = {}) => {
  const idMaterial = overrides.idMaterial ?? ''
  const precioReferencia =
    overrides.precioReferencia ?? preciosMaestro[idMaterial] ?? 0

  return {
    id: crearId(),
    idMaterial,
    descripcion: '',
    cantidad: 1,
    precioUnitario: 0,
    precioReferencia: aNumero(precioReferencia),
    sobrecosto: false,
    ...overrides,
  }
}

const itemTieneSobrecosto = (item) => {
  const precio = aNumero(item.precioUnitario)
  const referencia = aNumero(item.precioReferencia)
  return referencia > 0 && precio > referencia
}

/**
 * Estado y cálculos del formulario de creación de órdenes de compra.
 *
 * @param {object} [opciones]
 * @param {Record<string, number>} [opciones.preciosMaestro] Mapa idMaterial → precio de referencia.
 * @param {number} [opciones.tasaIva]
 */
export function useOrdenCompra({
  preciosMaestro = {},
  tasaIva = IVA_TASA,
} = {}) {
  const [metadatos, setMetadatos] = useState(METADATOS_INICIALES)
  const [materiales, setMateriales] = useState([])
  const [requiereAutorizacionSobrecosto, setRequiereAutorizacionSobrecosto] =
    useState(false)

  const actualizarMetadatos = useCallback((campos) => {
    setMetadatos((prev) => {
      const nuevo = { ...prev, ...campos };
      
      // Auto-completar proveedor
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
      
      return nuevo;
    })
  }, [])

  const agregarMaterial = useCallback(
    (item = {}) => {
      setMateriales((prev) => [...prev, crearMaterial(item, preciosMaestro)])
    },
    [preciosMaestro],
  )

  const editarMaterial = useCallback(
    (id, campos) => {
      setMateriales((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item

          const actualizado = { ...item, ...campos }

          if (campos.codigo && MAESTRO_MATERIALES[campos.codigo]) {
            const mat = MAESTRO_MATERIALES[campos.codigo];
            actualizado.descripcion = mat.descripcion;
            actualizado.precioUnitario = mat.precioReferencia; // Sugerir precio de referencia
            actualizado.precioReferencia = mat.precioReferencia;
          }

          actualizado.sobrecosto = itemTieneSobrecosto(actualizado)
          return actualizado
        }),
      )
    },
    [preciosMaestro],
  )

  const eliminarMaterial = useCallback((id) => {
    setMateriales((prev) => prev.filter((item) => item.id !== id))
  }, [])

  useEffect(() => {
    const haySobrecosto = materiales.some((item) =>
      itemTieneSobrecosto({
        ...item,
        precioReferencia:
          aNumero(item.precioReferencia) ||
          aNumero(preciosMaestro[item.idMaterial]),
      }),
    )
    setRequiereAutorizacionSobrecosto((prev) =>
      prev === haySobrecosto ? prev : haySobrecosto,
    )
  }, [materiales, preciosMaestro])

  const validarSobrecostos = useCallback(() => {
    const siguientes = materiales.map((item) => {
      const referencia =
        aNumero(item.precioReferencia) ||
        aNumero(preciosMaestro[item.idMaterial])

      return {
        ...item,
        precioReferencia: referencia,
        sobrecosto: itemTieneSobrecosto({
          ...item,
          precioReferencia: referencia,
        }),
      }
    })

    const haySobrecosto = siguientes.some((item) => item.sobrecosto)
    setMateriales(siguientes)
    setRequiereAutorizacionSobrecosto(haySobrecosto)
    return haySobrecosto
  }, [materiales, preciosMaestro])

  const totales = useMemo(() => {
    const subtotal = materiales.reduce(
      (acc, item) => acc + aNumero(item.cantidad) * aNumero(item.precioUnitario),
      0,
    )
    const iva = subtotal * tasaIva
    const retenciones = calcularRetenciones({
      subtotal,
      iva,
      perfilProveedor: metadatos.proveedorData?.perfilTributario || 'Regimen Comun',
      tarifaIca: metadatos.obraData?.tarifaIca || 0.00696
    })
    const totalRetenciones = aNumero(retenciones.total)
    const total = subtotal + iva - totalRetenciones

    return {
      subtotal,
      iva,
      retenciones,
      totalRetenciones,
      total,
    }
  }, [materiales, metadatos, tasaIva])

  return {
    metadatos,
    actualizarMetadatos,
    materiales,
    agregarMaterial,
    editarMaterial,
    eliminarMaterial,
    totales,
    requiereAutorizacionSobrecosto,
    validarSobrecostos,
  }
}

export default useOrdenCompra
