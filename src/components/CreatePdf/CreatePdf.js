import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import '../../pages/assets/styles/DocDrafting.css'

// Ensure Times New Roman is used
Font.register({ family: "Times-Roman" });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
    // display: "flex",
    // flexDirection: "column",
    // gap: "5vh",
  },
  gap: {
    height: "5vh",
  },
  miniGap: {
    height: "2.5vh",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
  },
  centerHeader: {
    textAlign: "center",
  },
  paragraph: {
    textAlign: "center",
    fontSize: "9px",
  },
  paragraphUnderlineCenter: {
    textAlign: "center",
    textDecoration: "underline",
    width: "50%",
  },
  paragraphUnderlineCenterLeft:{
    textAlign: "left",
    textDecoration: "underline",
    width: "100%",
  },
  rowSpaceBetween: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  section: {
    marginBottom: 25,
    textAlign: "justify",
    display: "flex",
    flexDirection: "row",
    gap: "5vh",
    flexWrap: "wrap",
  },
  bold: {
    fontWeight: "bold",
    fontSize: 14,
  },
  signatureSection: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerAlignRight: {
    width: "100%",
    textAlign: "right",
    color: "blue",
  },
  signatureBlock: {
    width: "45%",
    textAlign: "center",
  },
  headerBoldCenter: {
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
  },
  signatureLine: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "black",
    width: "100%",
    paddingTop: 5,
  },
  scrollable: {
    maxHeight: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
  }
});

function CreatePdf({ formData }) {
  return (
    <Document style={styles.scrollable}>
      <Page size="A4" style={styles.page}>
        {/* Contract Header */}
        <Text style={styles.header}>Form 1</Text>
        <Text style={styles.header}>NOTICE OF APPLICATION</Text>
        <Text style={styles.paragraph}>(Criminal Proceedings Rules)</Text>

        <View style={styles.gap}></View>

        {/* Contract Introduction */}
        <View style={styles.rowSpaceBetween}>
          <View style={styles.centerHeader}>
            <Text>ONTARIO</Text>
            <Text>SUPERIOR COURT OF JUSTICE</Text>
            <Text style={styles.paragraphUnderlineCenter}>
              ________{formData.region}________
            </Text>
            <Text style={styles.paragraph}>Region</Text>
          </View>

          <View>
            <Text style={styles.paragraphUnderlineCenter}>
              ________{formData.courtfileno}________
            </Text>

            <Text style={styles.paragraph}>Court File No. (if known)</Text>
          </View>
        </View>

        <View style={styles.gap}></View>

        <View>
          <Text>BETWEEN: </Text>

          <View style={styles.gap}></View>

          <Text style={styles.headerBoldCenter}>HIS MAJESTY THE KING</Text>

          <Text style={styles.headerAlignRight}>{formData.applicant}</Text>

          <Text style={styles.headerBoldCenter}>- and -</Text>
          <Text style={styles.paragraph}>(Specify name of accused)</Text>

          <Text style={styles.headerAlignRight}>{formData.applicant}</Text>

        </View>

        <View style={styles.miniGap}></View>

        <View>
          <Text>TAKE NOTICE that an application will be brought on {formData.weekDay} day, the {formData.date}th of {formData.month},</Text>

          <Text style={styles.paragraphUnderlineCenter} >{formData.year}, at {formData.address}</Text>
          <View style={styles.miniGap}></View>

          <Text>for an order granting</Text>
          <View style={styles.miniGap}></View>

          <Text>{formData.relief}</Text>
        </View>

        <View style={styles.miniGap}></View>

        <View>
          <Text>THE GROUNDS FOR THIS APPLICATION ARE:</Text>

          <Text style={styles.paragraphUnderlineCenterLeft}>_________1. That {formData.reasonOne}_________</Text>
          <Text style={styles.paragraphUnderlineCenterLeft}>_________2. That {formData.reasonTwo}_________</Text>
          <Text >3. Such further and other grounds as counsel may advise and this Honourable Court may permit.</Text>
        </View>

        <View style={styles.miniGap}></View>

        <Text>IN SUPPORT OF THIS APPLICATOIN, THE APPLICANT RELIES UPON THE FOLLOWING:</Text>

        <Text>{formData.relies}</Text>

        {/* Client Details */}
        {/* <View style={styles.section}>
          <Text style={styles.bold}>Client Information:</Text>
          <Text>
            Name: {formData.Region} {formData.lastName}
          </Text>
          <Text>Email: {formData.email}</Text>
          <Text>Phone: {formData.phone}</Text>
          <Text>Address: {formData.address}</Text>
        </View> */}
      </Page>

      
    </Document>
  );
}

export default CreatePdf;
