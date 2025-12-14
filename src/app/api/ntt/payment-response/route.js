import { NextResponse } from "next/server";
import crypto from "crypto";
import { AESCipher } from "@/lib/AESCipher";
import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  const form = await req.formData();
  const encData = form.get("encData");

  const cipher = new AESCipher();
  const decrypted = cipher.decrypt(encData);
  const data = JSON.parse(decrypted);

  const status =
    data.payInstrument.responseDetails.statusCode;

  if (status !== "OTS0000") {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`
    );
  }

  const uid = data.payInstrument.extras.udf1;
  const items = JSON.parse(data.payInstrument.extras.udf2);
  const orderId =
    data.payInstrument.merchDetails.merchTxnId;
  const paymentId =
    data.payInstrument.payDetails.atomTxnId;

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
          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        }
      );
    } else if (item.type === "event") {
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
          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        }
      );
    } else if (item.type === "store") {
      await setDoc(
        doc(db, "store_orders", item.id, "orders", orderId),
        {
          uid,
          productId: item.id,
          productName: item.name,
          orderId,
          paymentId,
          createdAt: serverTimestamp(),
        }
      );
    }
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_URL}/orders`
  );
}
