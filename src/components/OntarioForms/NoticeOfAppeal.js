import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register font
Font.register({ family: "Times-Roman" });

const styles = StyleSheet.create({
  page: { padding: 72, fontSize: 12, fontFamily: "Times-Roman", lineHeight: 1.5 },
  header: { textAlign: "center", fontSize: 14, fontWeight: "bold" },
  paragraph: { fontSize: 12, marginBottom: 5 },
  underline: { textDecoration: "underline" },
  section: { marginBottom: 20 },
  line: { borderBottomWidth: 1, borderBottomColor: "black", marginBottom: 10, width: "100%" },
  bold: { fontWeight: "bold" },
  space: { height: 20 },
  indent: { marginLeft: 36 },
  doubleIndent: { marginLeft: 72 },
  centered: { textAlign: "center" },
});

const NoticeOfAppeal = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Page 1 */}
      <Text style={styles.centered}>Form 2</Text>
      <Text style={styles.centered}>NOTICE OF APPEAL</Text>
      <View style={styles.space} />
      <Text style={styles.centered}>ONTARIO</Text>
      <Text style={styles.centered}>SUPERIOR COURT OF JUSTICE</Text>
      <Text style={styles.centered}>(Criminal Code, sections 813 or 830 and Criminal Proceedings Rules, Rule 40)</Text>
      <View style={styles.space} />
      
      {/* Court File and Region */}
      <Text>Court File No. (if known):</Text>
      <Text style={styles.line}>{formData.courtfileno || "________"}</Text>
      <Text>Region:</Text>
      <Text style={styles.line}>{formData.region || "________"}</Text>
      <View style={styles.space} />
      
      {/* Between Statement */}
      <Text>BETWEEN:</Text>
      <Text style={styles.line}>HIS MAJESTY THE KING</Text>
      <Text>- and -</Text>
      <Text style={styles.line}>{formData.applicant || "[Specify Name of Accused]"}</Text>
      <View style={styles.space} />
      
      {/* Appeal Notice */}
      <Text>TAKE NOTICE that</Text>
      <Text style={styles.line}>{formData.applicant || "________"}</Text>
      <Text style={styles.indent}>
        (indicate the name of the accused or informant,
        (or the Attorney General of {formData.attorneyGeneral || "________"}, on behalf of His Majesty the King))
      </Text>
      <Text style={styles.indent}>
        Appeals against the {formData.conviction || "[Conviction/Order/Sentence]"} on {formData.date || "[Date]"}
      </Text>
      <Text style={styles.indent}>For the following offence(s): {formData.offences || "[List Offences]"}</Text>
      <Text style={styles.indent}>
        Made by {formData.judge || "[Judge's Name]"} of the Ontario Court of Justice at {formData.location || "[Location]"}, Ontario
      </Text>
      <Text style={styles.indent}>{formData.appealDate || "________"}, 20{formData.year || "__"}.</Text>
      <View style={styles.space} />
      
      {/* Hearing Dates */}
      <Text>The dates upon which the summary conviction court heard evidence are as follows:</Text>
      <Text style={styles.line}>{formData.hearingDates || "________"}</Text>
      <View style={styles.space} />
      
      {/* Page 2 - Grounds for Appeal */}
      <Text>THE GROUNDS FOR THIS APPEAL ARE:</Text>
      <Text style={styles.indent}>1. {formData.groundOne || "[Ground 1]"}</Text>
      <Text style={styles.indent}>2. {formData.groundTwo || "[Ground 2]"}</Text>
      <Text style={styles.indent}>3. Such further and other grounds as counsel may advise and this Honourable Court may permit.</Text>
      <View style={styles.space} />
      
      {/* Evidence Relied Upon */}
      <Text>ON THE HEARING OF THIS APPEAL, THE APPELLANT WILL RELY UPON:</Text>
      <Text style={styles.indent}>{formData.relies || "[Documents, Transcripts, Evidence]"}</Text>
      <View style={styles.space} />
      
      {/* Relief Sought */}
      <Text>THE RELIEF SOUGHT IS:</Text>
      <Text style={styles.indent}>1. An Order allowing the appeal</Text>
      <Text style={styles.indent}>{formData.relief || "[Relief Sought]"}</Text>
      <View style={styles.space} />
      
      {/* Page 3 - Contact Information */}
      <Text>THE APPELLANT MAY BE SERVED WITH DOCUMENTS PERTINENT TO THIS APPEAL:</Text>
      <Text style={styles.indent}>1. By service in accordance with rule 5, through:</Text>
      <Text style={styles.line}>{formData.address || "[Specify Address, Phone Number, Email]"}</Text>
      <View style={styles.space} />
      
      {/* Signature and Date */}
      <Text>DATED at {formData.location || "[City]"}, Ontario,</Text>
      <Text>on this {formData.date || "[Date]"} day of {formData.month || "[Month]"}, 20{formData.year || "__"}.</Text>
      <View style={styles.space} />
      <Text>Signature of Appellant or Counsel:</Text>
      <Text style={styles.line}>{formData.signature || "________"}</Text>
      <Text>(set out name and address, as well as telephone number and email)</Text>
    </Page>
  </Document>
);

export default NoticeOfAppeal;
