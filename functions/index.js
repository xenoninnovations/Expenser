const logger = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");

const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

initializeApp();

exports.createInvoice = onCall(async (data, context) => {

  //gets existing client info from firebase
  const { email, taskIds } = data;

  if (!email || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "email and taskIds are required.");
  }

  const clientRef = admin.firestore().doc(`clients/email`)
  const clientDoc = await cleitnRef.get();
  if (!clientDoc.exists) throw new Error("Client not found");
  const clientData = clientDoc.data();

  //gets the stripe customer or creates a new one if they dont exist yet
  let stripeClientId = clientData.stripeClientId;
  if(!stripeClientId){
    const stripeClient = await stripe.customers.create({email});
    stripeClientId = stripeClient.id;
    await clientRef.set({stripeClientId}, {merge: true});
  }
  

  // Fetch and validate tasks
  const taskRefs = taskIds.map(id => admin.firestire().collection("Tasks").doc(id));
  const taskDocs = await admin.firestore().getAll(...taskRefs);

  const validTasks = [];
  for (const doc of taskDocs) {
    if (!doc.exists) throw new Error(`Task ${doc.id} does not exist`);
    const task = doc.data();

    if (!task.outstanding) {
      throw new Error(`Task ${doc.id} is not outstanding`);
    }
    if (task.client !== email) {
      throw new Error(`Task ${doc.id} belongs to ${task.client} NOT ${email}`);
    }
    if (!task.fee || !task.description) {
      throw new Error(`Task ${doc.id} is missing invoice fields`);
    }

    validTasks.push({ ...task, id: doc.id, ref: doc.ref });
  }

  if (validTasks.length === 0) {
    throw new Error("No valid tasks found to invoice");
  }
  
 // Create invoice items
  for (const task of validTasks) {
    await stripe.invoiceItems.create({
      customer: stripeClientId,
      amount: task.amount,
      currency: task.currency,
      description: task.description,
    });
  }

  // Create and send invoice
  const invoice = await stripe.invoices.create({
    customer: stripeCustomerId,
    collection_method: "send_invoice",
    days_until_due: 3,
    auto_advance: true,
  });

  // Update tasks
  const batch = admin.firestore().batch();
  validTasks.forEach(task => {
    batch.update(task.ref, {
      status: "invoiced",
      invoiceId: invoice.id,
      invoicedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();

  return {
    invoiceUrl: invoice.hosted_invoice_url,
    invoiceId: invoice.id,
  };
});