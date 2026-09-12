import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 7,
    fontFamily: 'Helvetica',
  },
  // Contenedor principal con borde exterior grueso
  container: {
    borderWidth: 1.5,
    borderColor: '#000',
    width: '100%',
  },
  // Fila genérica
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  // Celdas
  cell: {
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
  },
  cellNoBorder: {
    padding: 3,
    justifyContent: 'center',
  },
  // Textos y etiquetas
  label: {
    fontFamily: 'Helvetica-Bold',
  },
  text: {
    fontFamily: 'Helvetica',
  },
  centerText: {
    textAlign: 'center',
  },
  rightText: {
    textAlign: 'right',
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
  },
  // Título principal
  mainTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    padding: 8,
  },
  
  // Tabla de items
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    height: 16,
  },
  // Anchos de columnas (Items)
  wItem: { width: '4%' },
  wDesc: { width: '46%' },
  wCant: { width: '6%' },
  wUnd: { width: '6%' },
  wVrUnit: { width: '10%' },
  wVrTotal: { width: '12%' },
  wSi: { width: '8%' },
  wNo: { width: '8%' },

  // Footer / Totales
  obsCol: { width: '40%', borderRightWidth: 1, borderRightColor: '#000', padding: 2 },
  totalsCol: { width: '20%', borderRightWidth: 1, borderRightColor: '#000' },
  actionsCol: { width: '40%' },
  
  totalsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    height: 14,
  },
  totalsLabel: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 2,
    fontFamily: 'Helvetica',
  },
  totalsValue: {
    width: '50%',
    padding: 2,
    textAlign: 'right',
  },
  
  // Firmas
  firmasContainer: {
    flexDirection: 'row',
    height: 50,
  },
  firmaCell: {
    width: '33.33%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  
  // Info inferior
  bottomInfo: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 6,
  }
})

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)

export function OrdenCompraPDF({ orden = {} }) {
  const {
    consecutivo = 'OC-000',
    fecha = new Date().toLocaleDateString('es-CO'),
    proveedor = {},
    obra = {},
    items = [],
    totales = {},
  } = orden;

  const retenciones = totales.retenciones || {};
  
  // Dividir fecha en DD, MM, YYYY si es posible
  const [day, month, year] = fecha.split('/') || ['', '', ''];

  // Para asegurar 13 filas en la tabla como en el formato Excel
  const maxFilas = 13;
  const filasCompletas = [...items];
  while (filasCompletas.length < maxFilas) {
    filasCompletas.push({});
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          
          {/* Fila 1 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '70%' }]}>
              <Text style={styles.mainTitle}>BUSTILLO INGENIERIA SAS</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '30%', padding: 8 }]}>
              <Text style={styles.label}>CODIGO:</Text>
            </View>
          </View>

          {/* Fila 2 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '40%' }]}>
              <Text style={styles.label}>TITULO: ORDEN DE COMPRA</Text>
            </View>
            <View style={[styles.cell, { width: '15%' }]}>
              <Text style={styles.label}>CONSECUTIVO No.</Text>
            </View>
            <View style={[styles.cell, { width: '10%', alignItems: 'center' }]}>
              <Text style={styles.boldText}>{consecutivo}</Text>
            </View>
            <View style={[styles.cell, { width: '10%' }]}>
              <Text style={[styles.label, { color: 'red' }]}>FECHA:</Text>
            </View>
            <View style={[styles.cell, { width: '8%', alignItems: 'center' }]}>
              <Text style={{ color: 'red' }}>{day || ''}</Text>
            </View>
            <View style={[styles.cell, { width: '8%', alignItems: 'center' }]}>
              <Text style={{ color: 'red' }}>{month || ''}</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '9%', alignItems: 'center' }]}>
              <Text style={{ color: 'red' }}>{year || ''}</Text>
            </View>
          </View>

          {/* Fila 3 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '5%', borderRightWidth: 0 }]}>
              <Text style={styles.label}>PARA</Text>
            </View>
            <View style={[styles.cell, { width: '30%', alignItems: 'center' }]}>
              <Text style={styles.boldText}>{proveedor.razonSocial?.toUpperCase() || ''}</Text>
            </View>
            <View style={[styles.cell, { width: '15%' }]}>
              <Text style={styles.text}>PROVEEDOR: EXISTE SI / NO</Text>
            </View>
            <View style={[styles.cell, { width: '5%' }]}>
              <Text style={styles.label}>Nit.:</Text>
            </View>
            <View style={[styles.cell, { width: '15%', alignItems: 'center' }]}>
              <Text style={styles.text}>{proveedor.nit || ''}</Text>
            </View>
            <View style={[styles.cell, { width: '10%' }]}>
              <Text style={styles.label}>Teléfono:</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '20%' }]}>
              <Text style={styles.text}>{proveedor.telefono || ''}</Text>
            </View>
          </View>

          {/* Fila 4 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '40%' }]}>
              <Text style={styles.text}>DPTO DE VENTAS: ADMINISTRACIÓN</Text>
            </View>
            <View style={[styles.cell, { width: '10%' }]}>
              <Text style={styles.label}>Dirección:</Text>
            </View>
            <View style={[styles.cell, { width: '30%' }]}>
              <Text style={styles.text}>{proveedor.direccion || ''}</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '20%' }]}>
              <Text style={styles.label}>FAX:</Text>
            </View>
          </View>

          {/* Fila 5 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '5%', borderRightWidth: 0 }]}>
              <Text style={styles.label}>DE</Text>
            </View>
            <View style={[styles.cell, { width: '35%' }]}>
              <Text style={styles.text}>EDNA VERGARA OTERO</Text>
            </View>
            <View style={[styles.cell, { width: '15%' }]}>
              <Text style={styles.label}>FORMA DE PAGO:</Text>
            </View>
            <View style={[styles.cell, { width: '25%' }]}>
              <Text style={styles.text}>{proveedor.formaPago || 'CONTADO'}</Text>
            </View>
            <View style={[styles.cell, { width: '10%', borderRightWidth: 0 }]}>
              <Text style={styles.label}>Teléfono:</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '10%' }]}>
              <Text style={styles.text}>MONTELIBANO</Text>
            </View>
          </View>

          {/* Fila 6 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '80%' }]}>
              <Text style={styles.boldText}>TERMOCANDELARIA</Text>
            </View>
            <View style={[styles.cell, { width: '10%', borderRightWidth: 0 }]}>
              <Text style={styles.label}>FAX:</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '10%' }]}>
              <Text style={styles.text}>MONTELIBANO</Text>
            </View>
          </View>

          {/* Fila 7 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '60%' }]}>
              <Text style={styles.label}>FECHA EN LA QUE SE REQUIERE EL MATERIAL:</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '40%', alignItems: 'center' }]}>
              <Text style={styles.label}>Verificación producto Comprado</Text>
            </View>
          </View>

          {/* Fila 8 */}
          <View style={styles.row}>
            <View style={[styles.cell, { width: '5%', borderRightWidth: 0 }]}>
              <Text style={styles.label}>OBRA</Text>
            </View>
            <View style={[styles.cell, { width: '35%' }]}>
              <Text style={styles.text}>{obra.nombre?.toUpperCase() || ''}</Text>
            </View>
            <View style={[styles.cell, { width: '5%', borderRightWidth: 0 }]}>
              <Text style={styles.label}>Email</Text>
            </View>
            <View style={[styles.cell, { width: '25%', alignItems: 'center' }]}>
              <Text style={[styles.text, { color: 'blue', textDecoration: 'underline' }]}>
                proyectos.cartagena@bustilloingenieria.com
              </Text>
            </View>
            <View style={[styles.cell, { width: '10%', alignItems: 'center' }]}>
              <Text style={[styles.text, styles.centerText]}>Cantidad Recibida</Text>
            </View>
            <View style={[styles.cell, { width: '10%', alignItems: 'center' }]}>
              <Text style={[styles.text, styles.centerText]}>Cumple especificaciones</Text>
            </View>
            <View style={[styles.cellNoBorder, { width: '10%', alignItems: 'center' }]}>
              <Text style={[styles.text, styles.centerText]}>Fecha recibo producto</Text>
            </View>
          </View>

          {/* Cabecera Tabla */}
          <View style={styles.tableHeader}>
            <View style={[styles.cell, styles.wItem]}><Text style={styles.label}>ITEM</Text></View>
            <View style={[styles.cell, styles.wDesc]}><Text style={styles.label}>DESCRIPCION</Text></View>
            <View style={[styles.cell, styles.wCant]}><Text style={styles.label}>CANT</Text></View>
            <View style={[styles.cell, styles.wUnd]}><Text style={styles.label}>UND</Text></View>
            <View style={[styles.cell, styles.wVrUnit]}><Text style={styles.label}>VR. UNIT</Text></View>
            <View style={[styles.cell, styles.wVrTotal]}><Text style={styles.label}>VR. TOTAL</Text></View>
            <View style={[styles.cell, { width: '5%', borderRightColor: '#000' }]}><Text style={styles.label}>SI</Text></View>
            <View style={[styles.cell, { width: '5%', borderRightColor: '#000' }]}><Text style={styles.label}>NO</Text></View>
            <View style={[styles.cellNoBorder, { width: '10%' }]}><Text></Text></View>
          </View>

          {/* Filas Tabla */}
          {filasCompletas.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.cell, styles.wItem, { alignItems: 'center' }]}>
                <Text style={styles.text}>{index + 1}</Text>
              </View>
              <View style={[styles.cell, styles.wDesc]}>
                <Text style={styles.text}>{item.descripcion || ''}</Text>
              </View>
              <View style={[styles.cell, styles.wCant, { alignItems: 'center' }]}>
                <Text style={styles.text}>{item.cantidad || ''}</Text>
              </View>
              <View style={[styles.cell, styles.wUnd, { alignItems: 'center' }]}>
                <Text style={styles.text}>{item.descripcion ? 'UND' : ''}</Text>
              </View>
              <View style={[styles.cell, styles.wVrUnit, { alignItems: 'flex-end' }]}>
                <Text style={styles.text}>{item.precioUnitario ? formatoMoneda(item.precioUnitario) : ''}</Text>
              </View>
              <View style={[styles.cell, styles.wVrTotal, { alignItems: 'flex-end' }]}>
                <Text style={styles.text}>
                  {item.precioUnitario ? formatoMoneda((item.cantidad || 0) * item.precioUnitario) : (item.descripcion ? '$0' : '')}
                </Text>
              </View>
              <View style={[styles.cell, { width: '5%' }]}></View>
              <View style={[styles.cell, { width: '5%' }]}></View>
              <View style={[styles.cellNoBorder, { width: '10%' }]}></View>
            </View>
          ))}

          {/* Pie / Totales */}
          <View style={{ flexDirection: 'row' }}>
            {/* Columna Observaciones */}
            <View style={styles.obsCol}>
              <Text style={[styles.label, { fontSize: 6 }]}>
                OBSERVACIONES: 1. SON REQUISITOS DE APROBACION PARA ACEPTAR
              </Text>
              <Text style={[styles.text, { fontSize: 6 }]}>ESTA MERCANCIA LAS ESPECIFICACIONES DE LOS MATERIALES DESCRITOS</Text>
              <Text style={[styles.text, { fontSize: 6 }]}>Y LA FECHA DE ENTREGA. SE HARA DEVOLUCION EN CASO DEL NO</Text>
              <Text style={[styles.text, { fontSize: 6 }]}>CUMPLIMIENTO</Text>
              <Text style={[styles.text, { fontSize: 6 }]}>2. SIN LA PRESENTACION DE LA ORDEN DE COMPRA NO SE RECIBE</Text>
              <Text style={[styles.text, { fontSize: 6 }]}>LA FACTURA.</Text>
            </View>

            {/* Columna Totales */}
            <View style={styles.totalsCol}>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>TOTAL</Text></View>
                <View style={styles.totalsValue}><Text>{formatoMoneda(totales.subtotal)}</Text></View>
              </View>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>FLETE</Text></View>
                <View style={styles.totalsValue}><Text>$0</Text></View>
              </View>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>SUBTOTAL</Text></View>
                <View style={styles.totalsValue}><Text>{formatoMoneda(totales.subtotal)}</Text></View>
              </View>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>IVA</Text></View>
                <View style={styles.totalsValue}><Text>{formatoMoneda(totales.iva)}</Text></View>
              </View>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>RET IVA</Text></View>
                <View style={styles.totalsValue}><Text>{retenciones.reteiva > 0 ? formatoMoneda(retenciones.reteiva) : '$0'}</Text></View>
              </View>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>RET 2.5%</Text></View>
                <View style={styles.totalsValue}><Text>{retenciones.retefuente > 0 ? formatoMoneda(retenciones.retefuente) : '$0'}</Text></View>
              </View>
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}><Text>ICA 7/1000</Text></View>
                <View style={styles.totalsValue}><Text>{retenciones.reteica > 0 ? formatoMoneda(retenciones.reteica) : '$0'}</Text></View>
              </View>
              <View style={[styles.totalsRow, { borderBottomWidth: 0 }]}>
                <View style={styles.totalsLabel}><Text style={styles.label}>VALOR TOTAL</Text></View>
                <View style={styles.totalsValue}><Text style={styles.boldText}>{formatoMoneda(totales.total)}</Text></View>
              </View>
            </View>

            {/* Columna Acciones */}
            <View style={styles.actionsCol}>
              <View style={[styles.totalsRow, { height: 14 }]} >
                <Text style={{ fontSize: 5, padding: 2 }}>ACCIONES A TOMAR EN CASO DE QUE EL MATERIAL NO CORRESPONDA CON LO SOLICITADO</Text>
              </View>
              <View style={[styles.totalsRow, { height: 14 }]} >
                <View style={{ width: '30%', padding: 2 }}><Text>DEVUELTO</Text></View>
                <View style={{ width: '70%', padding: 2 }}><Text>AUTORIZADO POR:</Text></View>
              </View>
              <View style={[styles.totalsRow, { height: 14 }]} >
                <Text style={{ padding: 2 }}>DEVUELTO AL PROVEEDOR</Text>
              </View>
              <View style={[styles.totalsRow, { height: 14 }]} >
                <Text></Text>
              </View>
              <View style={[styles.totalsRow, { height: 14 }]} >
                <View style={{ width: '40%', padding: 2 }}><Text>TRASLADO A OTRA OBRA</Text></View>
                <View style={{ width: '60%', padding: 2 }}><Text>OBRA A DONDE SE TRASLADO:</Text></View>
              </View>
              <View style={[styles.totalsRow, { height: 14, borderBottomWidth: 0 }]} >
                <View style={{ width: '40%', padding: 2 }}><Text>OTRA</Text></View>
                <View style={{ width: '60%', padding: 2 }}><Text>ACLARE CUAL:</Text></View>
              </View>
            </View>
          </View>

          {/* Firmas */}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#000', borderBottomWidth: 0 }]}>
            <View style={styles.firmaCell}>
              <Text style={styles.text}>Vo.Bo. Comercial</Text>
            </View>
            <View style={[styles.firmaCell, { alignItems: 'center' }]}>
              <Text style={styles.boldText}>EDNA VERGARA OTERO</Text>
              <Text style={[styles.text, { fontSize: 6 }]}>ANALISTA DE COMPRAS Y LOGISTICA</Text>
            </View>
            <View style={[styles.firmaCell, { borderRightWidth: 0, alignItems: 'flex-start', justifyContent: 'flex-end', paddingLeft: 4 }]}>
              <Text style={styles.text}>Responsable Verificación Producto Comprado</Text>
            </View>
          </View>

        </View>

        <View style={styles.bottomInfo}>
          <Text>Barrio Bellavista Cra 56 B 7A-45</Text>
          <Text>Teléfono 6517077 - email: comprasylogisticacartagena@bustilloingenieria.com</Text>
          <Text>Cartagena de Indias</Text>
          <Text style={{ textAlign: 'right', marginTop: 4 }}>Filename C:/calidad/normalización/formatos/compras</Text>
        </View>

      </Page>
    </Document>
  )
}

export default OrdenCompraPDF
