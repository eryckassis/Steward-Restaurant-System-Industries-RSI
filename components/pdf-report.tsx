"use client"

import type React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { ReportData } from "@/lib/types"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #333",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    color: "#444",
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
})

interface PDFReportProps {
  data: ReportData
}

export const PDFReport: React.FC<PDFReportProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Inventário</Text>
        <Text style={styles.subtitle}>{data.restaurant.name}</Text>
        <Text style={styles.subtitle}>Período: {data.period}</Text>
        <Text style={styles.subtitle}>Gerado em: {new Date(data.generated_at).toLocaleString("pt-BR")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo do Inventário</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Itens:</Text>
          <Text style={styles.value}>{data.inventory_summary.total_items}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valor Total:</Text>
          <Text style={styles.value}>R$ {data.inventory_summary.total_value.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Itens com Estoque Baixo:</Text>
          <Text style={styles.value}>{data.inventory_summary.low_stock_items}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Itens Críticos:</Text>
          <Text style={styles.value}>{data.inventory_summary.critical_stock_items}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Desperdício</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Quantidade Total Desperdiçada:</Text>
          <Text style={styles.value}>{data.waste_summary.total_waste}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Custo Total:</Text>
          <Text style={styles.value}>R$ {data.waste_summary.total_cost.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Movimentações de Estoque</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Entradas:</Text>
          <Text style={styles.value}>{data.stock_movements.total_entries}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Saídas:</Text>
          <Text style={styles.value}>{data.stock_movements.total_exits}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total de Desperdício:</Text>
          <Text style={styles.value}>{data.stock_movements.total_waste}</Text>
        </View>
      </View>
    </Page>
  </Document>
)
