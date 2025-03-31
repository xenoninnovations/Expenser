import React from 'react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function CreateInvoicePdf(formData) {
  const doc = new jsPDF();

  const calcTotal = () => {
    var sum = 0;
    formData.tasks.forEach((val) => (sum += +val.total));
    formData.services.forEach((val) => (sum += +val.total));
    console.log(sum)
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Invoice", 105, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Company Name", 20, 30);
  doc.text("Company Address", 20, 37);
  doc.text("Company Email", 20, 44);
  doc.text("Company Phone Number", 20, 51);

  doc.text(`Invoice #: 00123`, 140, 30);
  doc.text(`Date: ${formData.date}`, 140, 37);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, 70);
  doc.setFont("helvetica", "normal");
  doc.text("Client Name", 20, 78);
  doc.text("Client Address", 20, 85);
  doc.text(`${formData.phoneNumber}`, 20, 92);
  doc.text(`${formData.client}`, 20, 99);

  autoTable(doc, {
    startY: 110,
    head: [tasksColumns.map(col => col.header)],
    body: formData.tasks.map(item => [item.taskDescription, item.duration, item.total]),
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [servicesColumns.map(col => col.header)],
    body: formData.services.map(item => [item.service, item.term, item.total]),
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  doc.setFont("helvetica", "bold");
  doc.text(`Balance Due: $${calcTotal().toFixed(2)}`, 140, doc.lastAutoTable.finalY + 10);

  return doc;
}
