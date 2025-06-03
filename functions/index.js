const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const admin = require("firebase-admin");
require("dotenv").config();

initializeApp();

exports.createInvoice = onCall(async (data, context) => {
  console.log("Function triggered. Raw data:", data.data);
  console.log("Type of data:", typeof data.data);
  console.log("email:", data ? data.data.email : undefined);
  console.log("taskIds:", data ? data.data.taskIds : undefined);
  const stripe = require("stripe")(process.env.STRIPE_API_KEY);

  // gets existing client info from firebase
  const {email, taskIds} = data.data;

  if (!email || !Array.isArray(taskIds) || taskIds.length === 0) {
    throw new HttpsError(
        "invalid-argument",
        `email and taskIds are required.\n Received: ${email} and ${taskIds}`,
    );
  }

  const clientRef = admin.firestore().doc(`clients/${email}`);
  const clientDoc = await clientRef.get();
  if (!clientDoc.exists) {
    throw new HttpsError(
        "not-found",
        "Client not found",
    );
  }
  const clientData = clientDoc.data();

  // gets the stripe customer or creates a new one if they dont exist yet
  let stripeClientId = clientData.stripeClientId;
  if (!stripeClientId) {
    const stripeClient = await stripe.customers.create({email});
    stripeClientId = stripeClient.id;
    await clientRef.set({stripeClientId}, {merge: true});
  }


  // Fetch and validate tasks
  const taskRefs = taskIds.map((id) => admin.firestore()
      .collection("Tasks")
      .doc(id));
  const taskDocs = await admin.firestore().getAll(...taskRefs);

  const validTasks = [];
  for (const doc of taskDocs) {
    if (!doc.exists) {
      throw new HttpsError(
          "not-found",
          `Task ${doc.id} does not exist`,
      );
    }
    const task = doc.data();

    if (!task.outstanding) {
      throw new HttpsError(
          "failed-precondition",
          `Task ${doc.id} is not outstanding`,
      );
    }
    if (task.client !== email) {
      throw new HttpsError(
          "failed-precondition",
          `Task ${doc.id} belongs to ${task.client} NOT ${email}`,
      );
    }
    if (!task.amount) {
      throw new HttpsError(
          "invalid-argument",
          `Task ${doc.id} is missing invoice fields`,
      );
    }

    validTasks.push({...task, id: doc.id, ref: doc.ref});
  }

  if (validTasks.length === 0) {
    throw new HttpsError(
        "failed-precondition",
        "No valid tasks found to invoice",
    );
  }

  // Create and send invoice
  const invoice = await stripe.invoices.create({
    customer: stripeClientId,
    collection_method: "send_invoice",
    days_until_due: 3,
    auto_advance: false,
  });

  // Create invoice items
  for (const task of validTasks) {
    await stripe.invoiceItems.create({
      customer: stripeClientId,
      invoice: invoice.id,
      pricing: {
        price: task.price_id,
      },
      quantity: Number(task.amount) || 1,
    });
  }

  await stripe.invoices.finalizeInvoice(invoice.id);

  // Update tasks
  const batch = admin.firestore().batch();
  validTasks.forEach((task) => {
    batch.update(task.ref, {
      outstanding: false,
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


exports.getStripeItems = onCall(async (request) => {
  const stripe = require("stripe")(process.env.STRIPE_API_KEY);
  try {
    // Fetch active products and prices from Stripe
    const productsResponse = await stripe.products.list({active: true});
    const pricesResponse = await stripe.prices.list({active: true});
    // Fetch all coupons (discounts)
    const couponsResponse = await stripe.coupons.list({limit: 100});

    // Map prices to their products
    const productsMap = {};
    productsResponse.data.forEach((product) => {
      productsMap[product.id] = {...product, prices: []};
    });
    pricesResponse.data.forEach((price) => {
      if (productsMap[price.product]) {
        productsMap[price.product].prices.push(price);
      }
    });

    // Prepare return data
    const products = Object.values(productsMap);
    const coupons = couponsResponse.data;

    return {products, coupons};
  } catch (error) {
    console.error("Error fetching Stripe data:", error);
    throw new HttpsError(
        "failed-precondition",
        "Failed to fetch products and discounts",
    );
  }
});


exports.getCustomerInvoices = onCall(async (data, context) => {
  const stripe = require("stripe")(process.env.STRIPE_API_KEY);

  const email = data.data.email;

  const clientRef = admin.firestore().doc(`clients/${email}`);
  const clientDoc = await clientRef.get();
  if (!clientDoc.exists) {
    throw new HttpsError(
        "not-found",
        "Client not found",
    );
  }
  const clientData = clientDoc.data();

  const stripeClientId = clientData.stripeClientId;

  if (!stripeClientId) {
    throw new HttpsError(
        "not-found",
        `Client ${email} did not have stripeClientId`,
    );
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: stripeClientId,
      limit: 100,
    });

    return {invoices: invoices.data};
  } catch (e) {
    throw new HttpsError(
        "internal",
        `Unable to retrieve ${email} invoices`,
    );
  }
});
