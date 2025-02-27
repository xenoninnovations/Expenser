import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({ family: "Times-Roman" });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  gap: { height: "5vh" },
  miniGap: { height: "2.5vh" },
  header: { textAlign: "center", fontSize: 20, fontWeight: "bold" },
  paragraph: { textAlign: "center", fontSize: "9px" },
  paragraphUnderlineCenter: {
    textAlign: "center",
    textDecoration: "underline",
    width: "50%",
  },
  rowSpaceBetween: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  headerBoldCenter: { width: "100%", textAlign: "center", fontWeight: "bold" },
  headerAlignRight: { width: "100%", textAlign: "right", color: "blue" },
  paragraphUnderlineCenterLeft: {
    textAlign: "left",
    textDecoration: "underline",
    width: "100%",
  },
});

const NoticeOfApplication = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Form 1</Text>
      <Text style={styles.header}>NOTICE OF APPLICATION</Text>
      <Text style={styles.paragraph}>(Criminal Proceedings Rules)</Text>

      <View style={styles.gap} />

      {/* Court Details */}
      <View style={styles.rowSpaceBetween}>
        <View>
          <Text>ONTARIO</Text>
          <Text>SUPERIOR COURT OF JUSTICE</Text>
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
        <Text style={styles.headerAlignRight}>{formData.applicant || "________"}</Text>
        <Text style={styles.headerBoldCenter}>- and -</Text>
        <Text style={styles.paragraph}>(Specify name of accused)</Text>
        <Text style={styles.headerAlignRight}>{formData.applicant || "________"}</Text>
      </View>

      <View style={styles.miniGap} />

      {/* Application Details */}
      <View>
        <Text>
          TAKE NOTICE that an application will be brought on {formData.weekDay || "[Weekday]"} day, 
          the {formData.date || "[Date]"}th of {formData.month || "[Month]"},
        </Text>
        <Text style={styles.paragraphUnderlineCenter}>
          {formData.year || "[Year]"}, at {formData.address || "[Address]"}
        </Text>
        <View style={styles.miniGap} />
        <Text>for an order granting</Text>
        <View style={styles.miniGap} />
        <Text>{formData.relief || "[Relief sought]"}</Text>
      </View>

      <View style={styles.miniGap} />

      {/* Grounds for Application */}
      <View>
        <Text>THE GROUNDS FOR THIS APPLICATION ARE:</Text>
        <Text style={styles.paragraphUnderlineCenterLeft}>
          1. That {formData.reasonOne || "[Ground 1]"}
        </Text>
        <Text style={styles.paragraphUnderlineCenterLeft}>
          2. That {formData.reasonTwo || "[Ground 2]"}
        </Text>
        <Text>3. Such further and other grounds as counsel may advise and this Honourable Court may permit.</Text>
      </View>

      <View style={styles.miniGap} />

      {/* Supporting Documents */}
      <Text>IN SUPPORT OF THIS APPLICATION, THE APPLICANT RELIES UPON THE FOLLOWING:</Text>
      <Text>{formData.relies || "[Supporting documents, transcripts, or evidence]"}</Text>
    </Page>
  </Document>
);

export default NoticeOfApplication;
