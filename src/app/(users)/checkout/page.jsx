"use client";
import { useCart } from "@/context/CartContext";
import { useAuthUser } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";
import {toast} from "react-hot-toast"

export default function CheckoutPage() {
    const { cart, totalPrice, emptyCart } = useCart();
    const { currentUser } = useAuthUser();
    const router = useRouter();

    const handlePayment = async () => {
        if (!cart.length) return toast.error("Cart is empty!");

        if (!window.Razorpay) {
           toast.error("Payment SDK not loaded. Try again.");
            return;
        }
        const res = await fetch("/api/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },   
            body: JSON.stringify({ amount: totalPrice() }),
        });

        if (!res.ok) {
            toast.error("Order creation failed");
            return;
        }

        const order = await res.json();

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
            amount: order.amount,
            currency: "INR",
            name: "Anwesha Store",
            description: "Store Checkout",
            order_id: order.id,
            handler: async (response) => {

            
                const verifyRes = await fetch("/api/razorpay/verify-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },   
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        uid: currentUser?.uid,
                        items: cart,
                        totalAmount: totalPrice()
                    })

                });

                const data = await verifyRes.json();

                if (data.success) {
                    emptyCart();
                    toast.success("Payment Successful!");
                    router.push("/orders");   
                } else {
                    toast.error("Payment verification failed! Contact support.");
                }
            },
            theme: {
                color: "#E63946",
            },
        };

        const razor = new window.Razorpay(options);

        
        razor.on("payment.failed", function (err) {
            toast.error("Payment failed. Try again!");
            console.error(err);
        });

        razor.open();
    };

    return (
        <div className="text-white p-10 bg-black">
            <h1 className="text-3xl mb-4 font-bold">Checkout</h1>

            {cart.map(item => (
                <p key={item.id}>{item.name} x {item.quantity}</p>
            ))}

            <h2 className="text-xl mt-4">Total: ₹{totalPrice()}</h2>

            <button className="btn-white mt-6" onClick={handlePayment}>
                Pay Now
            </button>
        </div>
    );
}
