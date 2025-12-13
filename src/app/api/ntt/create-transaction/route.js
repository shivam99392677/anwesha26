import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { uid, name, email, items, amount } = await req.json();

  const orderId = "ORD_" + Date.now();

  const payload = {
    login: process.env.NTT_LOGIN,
    pass: process.env.NTT_TXN_PASSWORD,
    ttype: "SALE", 
    prodid: process.env.NTT_PRODUCT_ID,
    amt: Number(amount).toFixed(2),
    txncurr: "INR",
    txnid: orderId,
    ru: `${process.env.NEXT_PUBLIC_BASE_URL}/api/ntt/payment-response`,

    // user defined fields (not part of hash)
    udf1: uid,
    udf2: JSON.stringify(items),
    udf3: name,
    udf4: email
  };

  // 🔐 HASH — STRICT ORDER (MANDATORY)
  const hashString = [
    payload.login,
    payload.pass,
    payload.ttype,
    payload.prodid,
    payload.amt,
    payload.txncurr,
    payload.txnid,
    payload.ru
  ].join("|");

  payload.hash = crypto
    .createHmac("sha512", process.env.NTT_REQ_HASH_KEY)
    .update(hashString)
    .digest("hex");

  return NextResponse.json({
    success: true,
    paymentUrl: process.env.NTT_PAYMENT_URL,
    payload
  });
}
