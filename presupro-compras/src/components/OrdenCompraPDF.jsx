import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

const formatCOP = (val = 0) => `$ ${Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 8.5, padding: 30, color: '#1e293b' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1.5, borderBottomColor: '#0f172a', paddingBottom: 10, marginBottom: 12 },
  companyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  companySub: { fontSize: 7.5, color: '#64748b', marginTop: 1 },
  docTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 3 },
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  colBox: { width: '49%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 7, backgroundColor: '#f8fafc' },
  colTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 2, marginBottom: 4 },
  rowField: { flexDirection: 'row', marginBottom: 2 },
  label: { width: '35%', fontSize: 7.2, fontFamily: 'Helvetica-Bold', color: '#475569' },
  value: { width: '65%', fontSize: 7.2, color: '#0f172a' },
  table: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 3, marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingVertical: 4 },
  th: { fontSize: 7.2, fontFamily: 'Helvetica-Bold', color: '#334155', textAlign: 'center' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 3.5, alignItems: 'center' },
  td: { fontSize: 7.2, color: '#1e293b', textAlign: 'center' },
  colItem: { width: '8%' }, colDesc: { width: '42%', textAlign: 'left', paddingLeft: 4 }, colCant: { width: '10%' }, colUnd: { width: '10%' }, colUnit: { width: '15%' }, colTotal: { width: '15%' },
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  totalsBox: { width: '45%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
  totRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0f172a', paddingHorizontal: 8, paddingVertical: 5 },
  footerSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8 },
  obsBox: { width: '60%' },
  signBox: { width: '35%', alignItems: 'center', paddingTop: 28 },
  signLine: { width: '100%', borderTopWidth: 1, borderTopColor: '#475569', marginBottom: 3 },
});

export const OrdenCompraPDF = ({ orden }) => {
  const { consecutivo = '', fechaEmision = '', proveedorSnapshot = {}, centroCosto = {}, items = [], resumenFinanciero = {} } = orden || {};

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.companyName}>BUSTILLO INGENIERIA SAS</Text>
            <Text style={styles.companySub}>NIT: 900.852.147-1 • Régimen Común</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.docTitle}>ORDEN DE COMPRA</Text>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold' }}>{consecutivo}</Text>
            <Text style={{ fontSize: 7.5, marginTop: 2 }}>Fecha: {fechaEmision}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.colBox}>
            <Text style={styles.colTitle}>DATOS DEL PROVEEDOR</Text>
            <View style={styles.rowField}><Text style={styles.label}>Nombre:</Text><Text style={styles.value}>{proveedorSnapshot.razonSocial}</Text></View>
            <View style={styles.rowField}><Text style={styles.label}>NIT:</Text><Text style={styles.value}>{proveedorSnapshot.nit}-{proveedorSnapshot.dv}</Text></View>
            <View style={styles.rowField}><Text style={styles.label}>Teléfono:</Text><Text style={styles.value}>{proveedorSnapshot.telefono}</Text></View>
          </View>
          <View style={styles.colBox}>
            <Text style={styles.colTitle}>DATOS DEL PROYECTO</Text>
            <View style={styles.rowField}><Text style={styles.label}>Obra:</Text><Text style={styles.value}>{centroCosto.nombre}</Text></View>
            <View style={styles.rowField}><Text style={styles.label}>Código:</Text><Text style={styles.value}>{centroCosto.codigo}</Text></View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colItem, styles.th]}>ITEM</Text>
            <Text style={[styles.colDesc, styles.th]}>DESCRIPCION</Text>
            <Text style={[styles.colCant, styles.th]}>CANT</Text>
            <Text style={[styles.colUnd, styles.th]}>UND</Text>
            <Text style={[styles.colUnit, styles.th]}>VR. UNIT</Text>
            <Text style={[styles.colTotal, styles.th]}>VR. TOTAL</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.colItem, styles.td]}>{i + 1}</Text>
              <Text style={[styles.colDesc, styles.td]}>{item.descripcion}</Text>
              <Text style={[styles.colCant, styles.td]}>{item.cantidad}</Text>
              <Text style={[styles.colUnd, styles.td]}>{item.unidad}</Text>
              <Text style={[styles.colUnit, styles.td, { textAlign: 'right' }]}>{formatCOP(item.precioUnitario)}</Text>
              <Text style={[styles.colTotal, styles.td, { textAlign: 'right' }]}>{formatCOP(item.subtotalNeto)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totRow}><Text style={styles.label}>SUBTOTAL:</Text><Text style={styles.value}>{formatCOP(resumenFinanciero.subtotal)}</Text></View>
            <View style={styles.totRow}><Text style={styles.label}>IVA:</Text><Text style={styles.value}>{formatCOP(resumenFinanciero.ivaTotal)}</Text></View>
            {resumenFinanciero.montoReteIVA > 0 && <View style={styles.totRow}><Text style={styles.label}>RET IVA:</Text><Text style={styles.value}>-{formatCOP(resumenFinanciero.montoReteIVA)}</Text></View>}
            {resumenFinanciero.montoReteFuente > 0 && <View style={styles.totRow}><Text style={styles.label}>RET 2.5%:</Text><Text style={styles.value}>-{formatCOP(resumenFinanciero.montoReteFuente)}</Text></View>}
            {resumenFinanciero.montoReteICA > 0 && <View style={styles.totRow}><Text style={styles.label}>ICA:</Text><Text style={styles.value}>-{formatCOP(resumenFinanciero.montoReteICA)}</Text></View>}
            <View style={styles.grandTotalRow}>
              <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: 'white' }}>VALOR TOTAL:</Text>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: 'white' }}>{formatCOP(resumenFinanciero.totalNeto)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerSection}>
          <View style={styles.obsBox}>
            <Text style={{ fontSize: 7.2, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>Observaciones:</Text>
            <Text style={{ fontSize: 6.5, color: '#64748b' }}>Favor radicar factura electrónica con remisión y copia de OC.</Text>
          </View>
          <View style={styles.signBox}>
            <View style={styles.signLine} />
            <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold' }}>Vo.Bo. Comercial / Analista de Compras</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default OrdenCompraPDF;
