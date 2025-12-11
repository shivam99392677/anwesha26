import crypto from "crypto";
import { db } from "@/lib/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
  try {
    const body = await req.json();

    const signCheck = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.razorpay_order_id + "|" + body.razorpay_payment_id)
      .digest("hex");

    if (signCheck !== body.razorpay_signature) {
      console.error("Signature mismatch");
      return Response.json({ success: false });
    }

    // Save order
    await setDoc(doc(db, "orders", body.razorpay_payment_id), {
      userId: body.uid,
      totalAmount: body.totalAmount,
      items: body.items,
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      createdAt: serverTimestamp(),
      status: "paid"
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Verification error:", err);
    return Response.json({ success: false });
  }
}
