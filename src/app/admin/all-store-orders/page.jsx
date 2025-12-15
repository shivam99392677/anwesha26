"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation";

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination states
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [pageHistory, setPageHistory] = useState([]);

  const PAGE_SIZE = 10;
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  // fetch ALL productIds from store-orders
  const fetchOrders = async () => {
    setLoading(true);

    try {
      const productsSnap = await getDocs(collection(db, "products"));
      const allOrders = [];

      for (let productDoc of productsSnap.docs) {
        const productId = productDoc.id;

        // Product details
        const productSnap = await getDoc(doc(db, "products", productId));
        const productData = productSnap.exists() ? productSnap.data() : {};

        // Orders inside this product
        const orders_snap = await getDocs(collection(db, "store_orders", productId, "orders"));
        console.log(orders_snap)

        for (let o of orders_snap.docs) {
            console.log("orderId",o)
          const order = o.data();
          const userSnap = await getDoc(doc(db, "users", order.uid));
          const userData = userSnap.exists() ? userSnap.data() : {};

          allOrders.push({
            id: o.id,
            orderId: o.id,
            productId: productId,
            productName: productData.name || order.productName || "Unknown Product",
            paymentId: order.paymentId || "N/A",
            date: order.createdAt?.toDate().toLocaleString() || "N/A",
            uid: order.uid,
            userName: order.name || "Unknown User",
            college: userData.college?.name || userData.college || "Unknown",
          });
        }
      }

      // sort by latest
      allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

      setOrders(allOrders.slice(0, PAGE_SIZE));
      setFirstVisible(allOrders[0]);
      setLastVisible(allOrders[PAGE_SIZE - 1]);
      setIsFirstPage(true);
      setIsLastPage(allOrders.length <= PAGE_SIZE);

      setPageHistory([]);
    } catch (err) {
      console.error("Error loading store orders:", err);
    }

    setLoading(false);
  };

  // next page
  const handleNextPage = async () => {
    if (isLastPage) return;

    setLoading(true);

    try {
      setPageHistory(prev => [...prev, firstVisible]);

      const startIndex = orders.findIndex(x => x.id === lastVisible.id) + 1;

      const nextOrders = orders.slice(startIndex, startIndex + PAGE_SIZE);
      if (nextOrders.length < PAGE_SIZE) setIsLastPage(true);

      setOrders(nextOrders);
      setFirstVisible(nextOrders[0]);
      setLastVisible(nextOrders[nextOrders.length - 1]);
    } catch (err) {
      console.error("Next page error:", err);
    }

    setLoading(false);
  };

  // previous page
  const handlePrevPage = async () => {
    if (isFirstPage || pageHistory.length === 0) return;

    setLoading(true);

    try {
      const prevItem = pageHistory[pageHistory.length - 1];
      const startIndex = orders.findIndex(x => x.id === prevItem.id) - PAGE_SIZE + 1;

      const newOrders = orders.slice(startIndex, startIndex + PAGE_SIZE);

      setOrders(newOrders);
      setFirstVisible(newOrders[0]);
      setLastVisible(newOrders[newOrders.length - 1]);

      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setIsFirstPage(newHistory.length === 0);
      setIsLastPage(false);
    } catch (err) {
      console.error("Prev page error:", err);
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12">
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <h2 className="text-3xl font-black text-white">Store Orders</h2>
        <p className="text-slate-400 text-sm mt-1">All merchandise orders</p>

        <table className="min-w-full mt-8 text-left">
          <thead>
            <tr className="uppercase text-slate-500 text-xs border-b border-slate-800">
              <th className="p-3">User</th>
              <th className="p-3">Product</th>
              <th className="p-3">Order ID</th>
              <th className="p-3">Payment ID</th>
              <th className="p-3">College</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer"
               onClick={() => router.push(`/admin/all-store-orders/${o.productId}/${o.orderId}`)}
              >
                <td className="p-3 font-bold">{o.userName}</td>
                <td className="p-3">{o.productName}</td>
                <td className="p-3 font-mono text-blue-400">{o.orderId}</td>
                <td className="p-3 text-purple-400">{o.paymentId}</td>
                <td className="p-3">{o.college}</td>
                <td className="p-3 text-slate-400">{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevPage}
            disabled={isFirstPage}
            className="px-5 py-2 rounded bg-slate-800 disabled:opacity-40"
          >
            Previous
          </button>

          <button
            onClick={handleNextPage}
            disabled={isLastPage}
            className="px-5 py-2 rounded bg-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
