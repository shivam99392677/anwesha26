import crypto from "crypto";
import { NextResponse } from "next/server";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function POST(req) {
  const formData = await req.formData();
  const data = Object.fromEntries(formData);

  const receivedHash = data.hash;

  // 🔐 RESPONSE HASH ORDER (STRICT)
  const hashString = [
    data.mer_txn,
    data.fcode,
    data.txnid,
    data.amt,
    data.txncur
  ].join("|");

  const calculatedHash = crypto
    .createHmac("sha512", process.env.NTT_RESP_HASH_KEY)
    .update(hashString)
    .digest("hex");

  if (receivedHash !== calculatedHash || data.fcode !== "Ok") {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`
    );
  }

  // Extract UDFs
  const uid = data.udf1;
  const items = JSON.parse(data.udf2);
  const name = data.udf3;
  const email = data.udf4;

  const orderId = data.txnid;
  const paymentId = data.mer_txn;

  // Save payment
  await setDoc(doc(db, "payments", paymentId), {
    userId: uid,
    name,
    email,
    items,
    totalAmount: data.amt,
    orderId,
    paymentId,
    status: "paid",
    createdAt: serverTimestamp(),
  });

  await processItems(items, uid, orderId, paymentId, name, email);

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/orders`
  );
}



async function processItems(items, uid, orderId, paymentId,name,email) {
  for (const item of items) {

    if (item.type === "event" && item.eventCategory === "multicity") {
      await setDoc(
        doc(db, "multicity", item.city, "registrations", orderId),
        {
          uid,
          eventId: item.id,
          eventName: item.name,
          city: item.city,
          date: item.date,
          name,
          email,
          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        }
      );
    }

    else if (item.type === "event") {
      const cleaned = item.id.replace(/\s+/g, "_");

      await setDoc(
        doc(db, "event_registrations", item.eventCategory, cleaned, orderId),
        {
          uid,
          eventId: item.id,
          eventName: item.name,
          eventCategory: item.eventCategory,
          city: item.city,
          date: item.date,
          name,
          email,
          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        }
      );
    }

    else if (item.type === "store") {
      await setDoc(
        doc(db, "store_orders", item.id, "orders", orderId),
        {
          uid,
          productId: item.id,
          productName: item.name,
          name,
          email,
          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        }
      );
    }
  }
}
