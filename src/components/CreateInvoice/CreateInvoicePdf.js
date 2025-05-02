import React from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../config';

export default async function CreateInvoicePdf(formData, isPreview, invoiceId) {
  const pdfDoc = new jsPDF();
  let clientInfo = {};

  try {
    const docRef = doc(db, "clients", formData.client);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      clientInfo = docSnap.data();
    }
  } catch (e) {
    console.error("Error fetching client: ", e);
  }

  const calcTotal = () => {
    var sum = 0;
    formData.tasks.forEach((val) => (sum += +val.total));
    formData.services.forEach((val) => (sum += +val.total));
    return sum;
  };

  const tasksColumns = [
    { header: "DESCRIPTION", dataKey: "description" },
    { header: "DURATION", dataKey: "duration" },
    { header: "TOTAL", dataKey: "total" },
  ];
  const servicesColumns = [
    { header: "DESCRIPTION", dataKey: "description" },
    { header: "TERM", dataKey: "term" },
    { header: "TOTAL", dataKey: "total" },
  ];

  pdfDoc.setFont("helvetica", "bold");
  pdfDoc.setFontSize(15);
  pdfDoc.text(`${isPreview ? "Preview Invoice" : "Invoice"}`, 105, 20, { align: "center" });

  pdfDoc.setFontSize(10);
  pdfDoc.setFont("helvetica", "normal");
  pdfDoc.text("Company Name", 20, 30);
  pdfDoc.text("Company Address", 20, 37);
  pdfDoc.text("Company Email", 20, 44);
  pdfDoc.text("Company Phone Number", 20, 51);

  pdfDoc.text(`${isPreview ? "Invoice #: Preview": `Invoice #: ${invoiceId}`}`, 140, 30);
  pdfDoc.text(`Date: ${formData.date}`, 140, 37);

  pdfDoc.setFont("helvetica", "bold");
  pdfDoc.text("Bill To:", 20, 70);
  pdfDoc.setFont("helvetica", "normal");
  pdfDoc.text(`${clientInfo.clientName || "Client Name"}`, 20, 78);
  pdfDoc.text(`${clientInfo.address || "Client Address"}`, 20, 85);
  pdfDoc.text(`${formData.phoneNumber || "Phone Number"}`, 20, 92);
  pdfDoc.text(`${formData.client || "Client Email"}`, 20, 99);

  autoTable(pdfDoc, {
    startY: 110,
    head: [tasksColumns.map(col => col.header)],
    body: formData.tasks.map(item => [item.taskDescription, item.duration, item.total]),
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  autoTable(pdfDoc, {
    startY: pdfDoc.lastAutoTable.finalY + 10,
    head: [servicesColumns.map(col => col.header)],
    body: formData.services.map(item => [item.service, item.term, item.total]),
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  pdfDoc.setFont("helvetica", "bold");
  pdfDoc.text(`Balance Due: $${calcTotal().toFixed(2)}`, 140, pdfDoc.lastAutoTable.finalY + 10);

  return pdfDoc;
}
