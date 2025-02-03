import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "right",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    flexGrow: 1,
  },
  bold: {
    fontWeight: "bold",
  },
  amountSection: {
    textAlign: "right",
    marginTop: 10,
  },
  notes: {
    marginTop: 20,
    padding: 10,
    border: "1 solid black",
  },
});

function CreatePdf({ formData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Invoice Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
          <Text>Invoice #: 12345</Text>
        </View>

        {/* Sender and Client Information */}
        <View style={styles.section}>
          <View>
            <Text style={styles.bold}>FROM:</Text>
            <Text>{formData.businessName || "Company Name"}</Text>
            <Text>{formData.email}</Text>
            <Text>{formData.address}</Text>
          </View>
          <View>
            <Text style={styles.bold}>TO:</Text>
            <Text>{formData.firstName} {formData.lastName}</Text>
            <Text>{formData.email}</Text>
            <Text>{formData.address}</Text>
          </View>
        </View>

        {/* Terms and Due Date */}
        <View style={styles.section}>
          <Text style={styles.bold}>TERMS:</Text>
          <Text>Net 30 Days</Text>
          <Text style={styles.bold}>DUE:</Text>
          <Text>Due Date</Text>
        </View>

        {/* Invoice Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.row, styles.bold]}>
            <Text style={[styles.cell, { flex: 3 }]}>Item Description</Text>
            <Text style={styles.cell}>Quantity</Text>
            <Text style={styles.cell}>Price</Text>
            <Text style={styles.cell}>Amount</Text>
          </View>
          {/* Sample Items */}
          {[...Array(5)].map((_, index) => (
            <View style={styles.row} key={index}>
              <Text style={[styles.cell, { flex: 3 }]}>Service {index + 1}</Text>
              <Text style={styles.cell}>1</Text>
              <Text style={styles.cell}>$0.00</Text>
              <Text style={styles.cell}>$0.00</Text>
            </View>
          ))}
        </View>

        {/* Amount Calculation */}
        <View style={styles.amountSection}>
          <Text>Subtotal: $0.00</Text>
          <Text>Tax: $0.00</Text>
          <Text style={styles.bold}>BALANCE DUE: $0.00</Text>
        </View>

        {/* Notes Section */}
        <View style={styles.notes}>
          <Text>Notes:</Text>
          <Text>Enter any special considerations here.</Text>
        </View>
      </Page>
    </Document>
  );
}

export default CreatePdf;
