import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register font (assuming Times New Roman as default legal font)
Font.register({ family: "Times-Roman" });

const styles = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 90,
    paddingRight: 72,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  gap: { height: "6vh" },
  miniGap: { height: "3vh" },
  header: { textAlign: "center", fontSize: 18, fontWeight: "bold" },
  paragraph: { textAlign: "left", fontSize: "12px" },
  paragraphUnderlineCenter: {
    textAlign: "left",
    textDecoration: "underline",
    width: "25%",
    alignSelf: "center",
  },
  rowSpaceBetween: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  headerBoldCenter: { width: "100%", textAlign: "center", fontWeight: "bold" },
  paragraphUnderlineLeft: {
    textAlign: "left",
    textDecoration: "underline",
    width: "100%",
  },
  paragraphCenter: {
    textAlign: "center",
  },
  paragraphFullWidthMiddle: {
    width: "100%",
    textAlign: "center",
  },
});

const SupplementaryNoticeOfAppeal = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Form 2A</Text>
      <Text style={styles.header}>SUPPLEMENTARY NOTICE OF APPEAL</Text>
      <Text style={styles.paragraphFullWidthMiddle}>(Criminal Proceedings Rules, Rule 40.09)</Text>

      <View style={styles.gap} />

      {/* Court Details */}
      <View style={styles.rowSpaceBetween}>
        <View>
          <Text style={styles.paragraphCenter}> ONTARIO {"\n"}
          SUPERIOR COURT OF JUSTICE</Text>
          <Text style={styles.paragraphUnderlineCenter}>
            {formData.region || "________"}
          </Text>
          <Text style={styles.paragraph}>Region</Text>
        </View>

        <View>
          <Text style={styles.paragraphUnderlineCenter}>
            {formData.courtfileno || "________"}
          </Text>
          <Text style={styles.paragraph}>Court File No. (if known)</Text>
        </View>
      </View>

      <View style={styles.gap} />

      {/* Parties Involved */}
      <View>
        <Text>BETWEEN: </Text>
        <View style={styles.gap} />
        <Text style={styles.headerBoldCenter}>HIS MAJESTY THE KING</Text>
        <Text style={styles.headerBoldCenter}>- and -</Text>
        <Text style={styles.paragraph}>(Specify name of accused)</Text>
        <Text style={styles.headerBoldCenter}>{formData.applicant || "________"}</Text>
      </View>

      <View style={styles.miniGap} />

      {/* Additional Appeal Grounds */}
      <View>
        <Text>
          TAKE NOTICE that in addition to the grounds of appeal set out in the Notice of Appeal filed on 
          {formData.date_filed || "________"}, 20{formData.year || "__"}, the Appellant will place reliance on the ground(s) of appeal set out below.
        </Text>
        <View style={styles.miniGap} />
        <Text>THE ADDITIONAL GROUNDS OF APPEAL ARE:</Text>
        <Text style={styles.paragraphUnderlineLeft}>
          1. That {formData.additional_grounds || "________"}
        </Text>
      </View>

      <View style={styles.miniGap} />

      {/* Signature Section */}
      <View>
        <Text>DATED at {formData.location || "________"},</Text>
        <Text>{formData.date || "________"}, 20{formData.year || "__"}.</Text>
        <View style={styles.miniGap} />
        <Text>Signature of appellant or counsel</Text>
        <Text>{formData.signature || "________"}</Text>
      </View>
    </Page>
  </Document>
);

export default SupplementaryNoticeOfAppeal;
