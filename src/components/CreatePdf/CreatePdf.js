import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Ensure Times New Roman is used
Font.register({ family: "Times-Roman" });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  section: {
    marginBottom: 25,
    textAlign: "justify",
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
  signatureBlock: {
    width: "45%",
    textAlign: "center",
  },
  signatureLine: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "black",
    width: "100%",
    paddingTop: 5,
  },
});

function CreatePdf({ formData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Contract Header */}
        <Text style={styles.header}>Contract for Services Rendered</Text>

        {/* Contract Introduction */}
        <View style={styles.section}>
          <Text>
            This contract is entered into by Jane Doe (hereinafter referred to
            as "the Contractor") and {formData.firstName} {formData.lastName}{" "}
            (hereinafter referred to as "the Client") on this date.
          </Text>
        </View>

        {/* Client Details */}
        <View style={styles.section}>
          <Text style={styles.bold}>Client Information:</Text>
          <Text>
            Name: {formData.firstName} {formData.lastName}
          </Text>
          <Text>Email: {formData.email}</Text>
          <Text>Phone: {formData.phone}</Text>
          <Text>Address: {formData.address}</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Scope and Manner of Services */}
        <View style={styles.section}>
          <Text style={styles.bold}>Scope and Manner of Services</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque vel nisl quis elit placerat commodo at sed enim. Nullam
            et ligula non dui sollicitudin scelerisque. Proin eu tellus non
            lorem luctus porta a at mi. Vivamus facilisis sagittis erat at
            lacinia. Nam ac massa auctor, aliquet leo id, cursus felis. Ut
            condimentum cursus purus, in semper purus aliquet sed. Aliquam erat
            volutpat. Donec ultricies eget neque ac facilisis. Nunc et metus
            metus. Sed fringilla neque nec turpis porttitor iaculis. Nulla
            cursus elit et lorem accumsan condimentum. Pellentesque dapibus dui
            eu nisi mattis, et vehicula erat elementum. Aliquam vulputate, leo
            eget dignissim sagittis, sem enim consectetur justo, non tempor
            metus felis vel nisi. Donec nec consectetur ante, sit amet
            condimentum mauris. Donec nisi eros, imperdiet vitae viverra at,
            dictum sed orci. Fusce at mattis dolor. Praesent diam enim, pretium
            vitae egestas sit amet, maximus eget tellus. Vestibulum ante ipsum
            primis in faucibus orci luctus et ultrices posuere cubilia curae;
            Donec vehicula vehicula dolor, nec consequat nibh semper vel. Mauris
            eros diam, convallis id lacus eu, tincidunt euismod mi. Morbi ligula
            enim, malesuada ut porttitor nec, volutpat sed lacus. Pellentesque
            id nulla vitae enim tempor rutrum nec nec lacus. Interdum et
            malesuada fames ac ante ipsum primis in faucibus. In bibendum lorem
            nec sagittis aliquam. Proin placerat, mauris vitae pharetra
            ullamcorper, nunc elit tincidunt felis, ut porttitor urna lacus a
            metus. Vestibulum malesuada felis quis risus dapibus gravida. Nunc
            eget ipsum lacus. Duis eu molestie sapien, a ultrices lorem. Nam
            eget interdum tellus. Morbi blandit dignissim tellus, et
            pellentesque urna dapibus vel. Pellentesque sed euismod tellus, eget
            euismod lacus. Donec in urna ligula. Pellentesque eu leo nisl. Donec
            blandit velit vitae urna pulvinar, in laoreet lectus porta.
            Curabitur et lacus aliquet, rhoncus mauris ac, mattis odio. Sed
            consequat placerat dictum. Aenean quis nulla sed magna mollis
            luctus. Maecenas fermentum purus purus, eget lacinia justo posuere
            eget. Nam at urna est. Nulla posuere iaculis posuere. Mauris quis
            rhoncus quam. Duis hendrerit vitae dolor in laoreet. Praesent
            dignissim nisi augue, ac efficitur eros ullamcorper nec. Quisque
            consectetur commodo volutpat. Mauris iaculis tristique augue eget
            consectetur. Sed luctus lacus a orci tempor iaculis. Praesent ut
            tristique magna. Vivamus a magna metus. Phasellus maximus tellus et
            libero interdum commodo. Integer nisi mauris, varius quis felis
            elementum, auctor bibendum ligula. Suspendisse et vestibulum erat,
            sagittis finibus felis. Duis vestibulum, purus at pharetra auctor,
            magna nunc sagittis diam, eget consequat dui lectus id eros. Nunc
            sit amet purus enim. Nulla nunc elit, facilisis a quam eget, mollis
            eleifend ex. Sed ac facilisis elit, non fermentum felis. Vivamus
            dapibus, mi eu fringilla elementum, ante leo tincidunt lorem, id
            sodales velit dui sed felis.
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Payment Terms */}
        <View style={styles.section}>
          <Text style={styles.bold}>Payment Terms</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque vel nisl quis elit placerat commodo at sed enim. Nullam
            et ligula non dui sollicitudin scelerisque. Proin eu tellus non
            lorem luctus porta a at mi. Vivamus facilisis sagittis erat at
            lacinia. Nam ac massa auctor, aliquet leo id, cursus felis. Ut
            condimentum cursus purus, in semper purus aliquet sed. Aliquam erat
            volutpat. Donec ultricies eget neque ac facilisis. Nunc et metus
            metus. Sed fringilla neque nec turpis porttitor iaculis. Nulla
            cursus elit et lorem accumsan condimentum. Pellentesque dapibus dui
            eu nisi mattis, et vehicula erat elementum. Aliquam vulputate, leo
            eget dignissim sagittis, sem enim consectetur justo, non tempor
            metus felis vel nisi. Donec nec consectetur ante, sit amet
            condimentum mauris. Donec nisi eros, imperdiet vitae viverra at,
            dictum sed orci. Fusce at mattis dolor. Praesent diam enim, pretium
            vitae egestas sit amet, maximus eget tellus. Vestibulum ante ipsum
            primis in faucibus orci luctus et ultrices posuere cubilia curae;
            Donec vehicula vehicula dolor, nec consequat nibh semper vel. Mauris
            eros diam, convallis id lacus eu, tincidunt euismod mi. Morbi ligula
            enim, malesuada ut porttitor nec, volutpat sed lacus. Pellentesque
            id nulla vitae enim tempor rutrum nec nec lacus. Interdum et
            malesuada fames ac ante ipsum primis in faucibus. In bibendum lorem
            nec sagittis aliquam. Proin placerat, mauris vitae pharetra
            ullamcorper, nunc elit tincidunt felis, ut porttitor urna lacus a
            metus. Vestibulum malesuada felis quis risus dapibus gravida. Nunc
            eget ipsum lacus. Duis eu molestie sapien, a ultrices lorem. Nam
            eget interdum tellus. Morbi blandit dignissim tellus, et
            pellentesque urna dapibus vel. Pellentesque sed euismod tellus, eget
            euismod lacus. Donec in urna ligula. Pellentesque eu leo nisl. Donec
            blandit velit vitae urna pulvinar, in laoreet lectus porta.
            Curabitur et lacus aliquet, rhoncus mauris ac, mattis odio. Sed
            consequat placerat dictum. Aenean quis nulla sed magna mollis
            luctus. Maecenas fermentum purus purus, eget lacinia justo posuere
            eget. Nam at urna est. Nulla posuere iaculis posuere. Mauris quis
            rhoncus quam. Duis hendrerit vitae dolor in laoreet. Praesent
            dignissim nisi augue, ac efficitur eros ullamcorper nec. Quisque
            consectetur commodo volutpat. Mauris iaculis tristique augue eget
            consectetur. Sed luctus lacus a orci tempor iaculis. Praesent ut
            tristique magna. Vivamus a magna metus. Phasellus maximus tellus et
            libero interdum commodo. Integer nisi mauris, varius quis felis
            elementum, auctor bibendum ligula. Suspendisse et vestibulum erat,
            sagittis finibus felis. Duis vestibulum, purus at pharetra auctor,
            magna nunc sagittis diam, eget consequat dui lectus id eros. Nunc
            sit amet purus enim. Nulla nunc elit, facilisis a quam eget, mollis
            eleifend ex. Sed ac facilisis elit, non fermentum felis. Vivamus
            dapibus, mi eu fringilla elementum, ante leo tincidunt lorem, id
            sodales velit dui sed felis.
          </Text>
        </View>

        {/* Applicable Law */}
        <View style={styles.section}>
          <Text style={styles.bold}>Applicable Law</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Pellentesque scelerisque, tortor vitae commodo euismod, lorem mi
            scelerisque nisi, et ornare odio ante ac magna. Morbi odio elit,
            sollicitudin ac aliquet condimentum, molestie fringilla augue. Proin
            a malesuada dolor, eu efficitur neque. Sed et elit quis ipsum
            laoreet consequat vitae sit amet augue. Etiam porta egestas est, a
            commodo odio elementum non. Vestibulum auctor enim et diam molestie
            tristique. Pellentesque ut ex blandit, vestibulum mauris at, porta
            nisi. Donec sit amet varius odio. In imperdiet blandit augue,
            consectetur placerat orci ultrices nec. Nunc faucibus ex et viverra
            blandit. Cras porttitor tempor tellus. Nunc tempus fringilla libero
            vitae consequat. Nunc nec orci vel erat consectetur commodo. Morbi
            rhoncus, velit malesuada eleifend venenatis, quam lorem pulvinar
            massa, nec mollis dolor purus vitae ante. Suspendisse commodo augue
            arcu, eu vehicula lacus commodo vel. Fusce consequat finibus justo,
            et bibendum nisl ultricies ut. Sed eu justo vulputate, vehicula
            magna vel, auctor urna. Nulla facilisi. In hac habitasse platea
            dictumst. Vestibulum at ipsum in ante suscipit dapibus sit amet ut
            ipsum. Duis eleifend eleifend mollis. Praesent volutpat nulla ut
            magna faucibus mollis. Fusce vitae lobortis odio. In sollicitudin
            elit at erat rutrum, vitae faucibus mi elementum. Curabitur non elit
            commodo, blandit nisl quis, finibus massa. Duis vel purus et nunc
            imperdiet semper sit amet et ipsum. Mauris volutpat in massa et
            sagittis. Suspendisse malesuada ligula vitae ligula pulvinar
            fermentum. Suspendisse a tempus enim. Cras ut tortor id justo congue
            sollicitudin. Mauris ultricies felis et arcu rutrum, non porta neque
            tristique. In urna justo, vehicula rutrum placerat nec, pharetra et
            quam. Nulla volutpat sit amet enim sed tincidunt. Fusce eu massa non
            turpis dapibus porttitor at non nisi. Integer bibendum dignissim
            iaculis. Aliquam erat volutpat. Sed a lacinia libero. Aliquam vel ex
            rhoncus, pulvinar dolor nec, eleifend augue. Curabitur rutrum sapien
            sapien, non dignissim dui accumsan non. Nunc ante eros, bibendum in
            malesuada vel, convallis et enim. Aliquam gravida, ex at finibus
            fermentum, velit elit eleifend odio, vel pellentesque lacus nulla
            vitae lectus. Duis quis pellentesque nulla. Cras blandit, libero non
            tincidunt eleifend, nulla metus vehicula velit, non pharetra neque
            sapien at risus. Vestibulum ante ipsum primis in faucibus orci
            luctus et ultrices posuere cubilia curae; Proin id porttitor magna.
            Aenean consectetur ante at diam suscipit efficitur. Morbi sit amet
            condimentum risus, at vehicula ipsum. Etiam a lacus eget lacus
            aliquet ultrices a at ante. Cras et sapien ante.
          </Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View>
            <Text style={styles.signatureLine}>
              {formData.firstName} {formData.lastName}
            </Text>
            <Text>Client Signature</Text>
          </View>
          <View>
            <Text style={styles.signatureLine}>Jane Doe</Text>
            <Text>Contractor Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default CreatePdf;
