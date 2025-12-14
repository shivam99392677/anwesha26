"use client";

import { useCart } from "@/context/CartContext";
import { useAuthUser } from "@/context/AuthUserContext";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";

export default function CheckoutPage() {
  const {
    cart,
    totalPrice,
    removeFromCart,
    addToCart,
    deleteCartItem,
  } = useCart();

  const { currentUser } = useAuthUser();

  // ---------------------- PAYMENT HANDLER ----------------------
  const handlePayment = async () => {
    if (!currentUser?.uid) {
      toast.error("User not logged in!");
      return;
    }

    if (!cart.length) {
      toast.error("Cart is empty!");
      return;
    }

    try {
      const res = await fetch("/api/ntt/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: currentUser.uid,
          name:
            currentUser.personal.firstName +
            " " +
            currentUser.personal.lastName,
          email: currentUser.email,
          items: cart,
          amount: totalPrice(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error("Payment initiation failed");
        return;
      }

      // 🔥 Atom requires FORM POST (NOT redirect)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.paymentUrl;

      Object.entries(data.payload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // ---------------------- UI ----------------------
  return (
    <div className="min-h-screen mt-6 bg-gradient-to-b from-black to-[#0a0a0a] flex justify-center px-5 py-10 text-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-10 text-center tracking-wide">
          Checkout
        </h1>

        {/* EMPTY CART */}
        {cart.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-2xl">Your cart is empty.</p>
          </div>
        )}

        {/* CART ITEMS */}
        {cart.length > 0 && (
          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="relative bg-[#141414] border border-gray-700 p-6 rounded-xl shadow-xl"
              >
                <FaTrash
                  onClick={() => deleteCartItem(item.id)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 cursor-pointer text-lg"
                />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-semibold">{item.name}</p>

                    <div className="flex gap-3 mt-2 items-center">
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                        {item.type === "event" ? "Event" : "Store"}
                      </span>

                      <span className="text-yellow-400 font-semibold">
                        ₹{item.cost}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="bg-gray-800 px-3 py-1 rounded-lg text-xl"
                      >
                        -
                      </button>

                      <span className="text-lg">{item.quantity}</span>

                      <button
                        onClick={() => addToCart(item)}
                        className="bg-gray-800 px-3 py-1 rounded-lg text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-green-400">
                    ₹{item.cost * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TOTAL */}
        {cart.length > 0 && (
          <div className="mt-10 bg-[#151515] p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between text-2xl font-semibold mb-6">
              <span>Total</span>
              <span>₹{totalPrice()}</span>
            </div>

            <button
              onClick={handlePayment}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-lg font-bold"
            >
              Proceed to Pay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
