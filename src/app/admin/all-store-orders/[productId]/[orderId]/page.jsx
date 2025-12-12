"use client";

import React,{ useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export default function StoreOrderDetails({ params }) {
 const { productId, orderId } = React.use(params);


  const [order, setOrder] = useState(null);
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      // Fetch order
      const orderSnap = await getDoc(
        doc(db, "store_orders", productId, "orders", orderId)
      );

      if (!orderSnap.exists()) {
        setOrder(null);
        setLoading(false);
        return;
      }

      const orderData = orderSnap.data();
      setOrder(orderData);

      // Fetch product info
      const productSnap = await getDoc(doc(db, "products", productId));
      setProduct(productSnap.exists() ? productSnap.data() : null);

      // Fetch user info
      const userSnap = await getDoc(doc(db, "users", orderData.uid));
      setUser(userSnap.exists() ? userSnap.data() : null);

      setLoading(false);
    } catch (e) {
      console.error("Error loading order details:", e);
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen text-white p-10 text-center">
        <h2 className="text-3xl font-bold">Order Not Found</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Store Order Details</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">

        {/* ORDER INFORMATION */}
        <h2 className="text-xl font-bold mb-4">Order Information</h2>
        <p><b>Order ID:</b> {orderId}</p>
        <p><b>Payment ID:</b> {order.paymentId || "N/A"}</p>
        <p><b>Date:</b> {order.createdAt?.toDate().toLocaleString()}</p>

        <hr className="my-6 border-slate-700" />

        {/* USER INFORMATION */}
        <h2 className="text-xl font-bold mb-4">User Information</h2>
        <p>
          <b>Name:</b>{" "}
          {user?.personal
            ? `${user.personal.firstName} ${user.personal.lastName}`
            : user?.name}
        </p>
        <p><b>Email:</b> {user?.email}</p>
        <p><b>College:</b> {user?.college?.name || "Unknown"}</p>

        <hr className="my-6 border-slate-700" />

        {/* PRODUCT INFORMATION */}
        <h2 className="text-xl font-bold mb-4">Product Information</h2>

        {product && (
          <div className="flex gap-6 items-start">
            <img
              src={product.img_src}
              alt={product.name}
              className="w-40 h-40 object-cover rounded-xl border border-slate-700"
            />

            <div>
              <p><b>Product Name:</b> {product.name}</p>
              <p><b>Cost:</b> ₹{product.cost}</p>
              <p><b>Stock:</b> {product.stock}</p>
              <p><b>Description:</b> {product.description}</p>
              <p><b>Type:</b> {product.type}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
