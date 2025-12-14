import { NextResponse } from "next/server";
import crypto from "crypto";
import { AESCipher } from "@/lib/AESCipher";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const encData = formData.get("encData");

    const cipher = new AESCipher(process.env.NTT_AES_RESP_KEY);
    const decrypted = cipher.decrypt(encData);
    const data = JSON.parse(decrypted); 

    const statusCode =
      data.payInstrument.responseDetails.statusCode;

    if (statusCode !== "OTS0000") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`
      );
    }

    const payDetails = data.payInstrument.payDetails;
    const merchDetails = data.payInstrument.merchDetails;
    const bankDetails =
      data.payInstrument.payModeSpecificData.bankDetails;

    // 🔐 SIGNATURE VERIFICATION
    const sigStr =
      merchDetails.merchId +
      payDetails.atomTxnId +
      merchDetails.merchTxnId +
      payDetails.totalAmount +
      statusCode +
      data.payInstrument.payModeSpecificData.subChannel[0] +
      bankDetails.bankTxnId;

    const expectedSig = crypto
      .createHmac("sha512", process.env.NTT_RESP_HASH_KEY)
      .update(sigStr)
      .digest("hex");

    if (expectedSig !== payDetails.signature) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`
      );
    }

    const extras = data.payInstrument.extras;

    // 🔥 SAVE PAYMENT
    await setDoc(doc(db, "payments", payDetails.atomTxnId), {
      uid: extras.udf1,
      items: JSON.parse(extras.udf2),
      name: extras.udf3,
      email: extras.udf4,
      amount: payDetails.totalAmount,
      atomTxnId: payDetails.atomTxnId,
      merchTxnId: merchDetails.merchTxnId,
      status: "paid",
      createdAt: serverTimestamp(),
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/orders`
    );
  } catch (err) {
    console.error("PAYMENT RESPONSE ERROR:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed`
    );
  }
}
