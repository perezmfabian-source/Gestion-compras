const redondear = (valor) => Math.round((Number(valor) || 0) * 100) / 100;

// Constantes tributarias proyectadas
export const UVT_ACTUAL = 52289; // Ejemplo para año 2026
export const TOPE_COMPRAS_UVT = 27; // Base para ReteFuente en compras generales
export const BASE_RETEFUENTE = UVT_ACTUAL * TOPE_COMPRAS_UVT;

/**
 * Motor Tributario para Colombia
 * @param {number} subtotal - Subtotal de la compra (base imponible)
 * @param {number} iva - Monto de IVA calculado
 * @param {string} perfilProveedor - Ej: 'Gran Contribuyente', 'Autorretenedor', 'Regimen Simple', 'Regimen Comun'
 * @param {string} perfilComprador - Por defecto 'Regimen Comun'
 * @param {number} tarifaIca - Tarifa de ICA local (ej. 0.00696 o 6.96/1000)
 * @returns {Object} Montos de retención calculados
 */
export function calcularRetenciones({
  subtotal = 0,
  iva = 0,
  perfilProveedor = 'Regimen Comun',
  perfilComprador = 'Regimen Comun',
  tarifaIca = 0.00696
} = {}) {
  const base = redondear(subtotal);
  const ivaBase = redondear(iva);

  let retefuente = 0;
  let reteica = 0;
  let reteiva = 0;

  // 1. ReteFuente (Aplica si supera tope de 27 UVT y el proveedor no es Autorretenedor ni Regimen Simple)
  if (base >= BASE_RETEFUENTE && perfilProveedor !== 'Autorretenedor' && perfilProveedor !== 'Regimen Simple') {
    retefuente = redondear(base * 0.025); // 2.5% declarantes
  }

  // 2. ReteICA (Aplica según tarifa local, a menos que sea Régimen Simple o exento)
  if (perfilProveedor !== 'Regimen Simple') {
    reteica = redondear(base * tarifaIca);
  }

  // 3. ReteIVA (Por ejemplo, si Comprador es Gran Contribuyente y Proveedor es Régimen Común)
  // O como agente retenedor de IVA.
  if (perfilComprador === 'Gran Contribuyente' && perfilProveedor === 'Regimen Comun') {
    reteiva = redondear(ivaBase * 0.15); // 15% del valor del IVA
  }

  // Total retenciones a descontar
  const totalRetenciones = redondear(retefuente + reteiva + reteica);

  return { retefuente, reteiva, reteica, totalRetenciones };
}
