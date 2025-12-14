import { NextResponse } from "next/server";
import { AESCipher } from "@/lib/AESCipher";

export async function POST(req) {
  const { uid, name, email, items, amount } = await req.json();

  const merchTxnId = Date.now().toString();
  const txnDate = new Date().toISOString().slice(0,19).replace("T"," ");

  const jsonData = {
    payInstrument: {
      headDetails: {
        version: "OTSv1.1",
        api: "AUTH",
        platform: "FLASH"
      },
      merchDetails: {
        merchId: "564719",
        password: process.env.NTT_TXN_PASSWORD,
        merchTxnId,
        merchTxnDate: txnDate
      },
      payDetails: {
        amount: String(amount),
        product: "STUDENT",
        txnCurrency: "INR"
      },
      custDetails: {
        custEmail: email,
        custMobile: "9999999999"
      },
      extras: {
        udf1: uid,
        udf2: JSON.stringify(items),
        udf3: name,
        udf4: email
      }
    }
  };

  const cipher = new AESCipher();
  const encData = cipher.encrypt(JSON.stringify(jsonData));

  const atomRes = await fetch(
    "https://payment1.atomtech.in/ots/aipay/auth",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        encData,
        merchId: "564719"
      })
    }
  );

  const text = await atomRes.text();

  // Atom response: encData=XXXX&merchId=XXXX
  const tokenEnc = text.split("&")[1].split("=")[1];
  const decrypted = cipher.decrypt(tokenEnc);
  const parsed = JSON.parse(decrypted.replace(/\s+/g,""));

  return NextResponse.json({
    success: true,
    paymentUrl: "https://payment1.atomtech.in/ots/payment",
    payload: {
      atomTokenId: parsed.atomTokenId,
      merchId: "564719",
      amount,
      // returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ntt/payment-response`
       returnUrl: "https://anweshabackend.shop/response/"
      
    }
  });
}
