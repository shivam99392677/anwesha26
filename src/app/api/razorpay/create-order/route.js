import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const body = await req.json();

    const razor = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET
    });

    const order = await razor.orders.create({
      amount: Number(body.amount) * 100, 
      currency: "INR"
    });

    return Response.json(order);
  } catch (error) {
    console.error("Order creation failed:", error);
    return Response.json({ error: true, message: "Order creation failed" });
  }
}
