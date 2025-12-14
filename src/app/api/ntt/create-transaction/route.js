import { NextResponse } from "next/server";
import crypto from "crypto";
import { AESCipher } from "@/lib/AESCipher";

export async function POST(req) {
  try {
    const { uid, name, email, items, amount } = await req.json();

    const merchTxnId = crypto.randomBytes(6).toString("hex");
    const txnDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      payInstrument: {
        headDetails: {
          version: "OTSv1.1",
          api: "AUTH",
          platform: "FLASH",
        },
        merchDetails: {
          merchId: process.env.NTT_MERCH_ID,
          userId: "",
          password: process.env.NTT_TXN_PASSWORD,
          merchTxnId,
          merchTxnDate: txnDate,
        },
        payDetails: {
          amount: String(amount),
          product: process.env.NTT_PRODUCT_ID,
          txnCurrency: "INR",
        },
        custDetails: {
          custEmail: email,
          custMobile: "9999999999",
        },
        extras: {
          udf1: uid,
          udf2: JSON.stringify(items),
          udf3: name,
          udf4: email,
        },
      },
    };

    const cipher = new AESCipher();
    const encData = cipher.encrypt(JSON.stringify(payload));

    const atomRes = await fetch(
      "https://payment1.atomtech.in/ots/aipay/auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          encData,
          merchId: process.env.NTT_MERCH_ID,
        }),
      }
    );

    const raw = await atomRes.text();
    if (!raw.includes("encData=")) {
      return NextResponse.json({ success: false });
    }

    const tokenEnc = raw.split("&")[1].split("=")[1];
    const decrypted = cipher.decrypt(tokenEnc);

    const cleaned = decrypted.replace(/\s+/g, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      paymentUrl: "https://payment1.atomtech.in/ots/payment",
      payload: {
        atomTokenId: parsed.atomTokenId,
        merchId: process.env.NTT_MERCH_ID,
        merchTxnId,
        amount,
        returnUrl:
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/ntt/payment-response`,
      },
    });
  } catch (err) {
    console.error("NTT CREATE ERROR:", err);
    return NextResponse.json({ success: false });
  }
}
