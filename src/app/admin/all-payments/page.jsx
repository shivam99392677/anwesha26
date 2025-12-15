"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast
} from "firebase/firestore";

import { db } from "@/lib/firebaseConfig";
import Link from "next/link";

// PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSearchParams } from "next/navigation";

export default function AllPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Pagination
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [pageHistory, setPageHistory] = useState([]);

  const PAYMENTS_PER_PAGE = 10;

  const searchParams = useSearchParams();
  const paymentIdFromURL = searchParams.get("paymentId");

  const formatDate = (ts) => {
  if (!ts) return "N/A";

  const date = ts.toDate ? ts.toDate() : new Date(ts);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  useEffect(() => {
    if (paymentIdFromURL) {
      fetchSinglePayment(paymentIdFromURL);
    } else {
      fetchFirstPage();
    }
  }, [paymentIdFromURL]);

  // Fetch single payment by ID
  const fetchSinglePayment = async (paymentId) => {
    setLoading(true);
    try {
      const paymentRef = doc(db, "payments", paymentId);
      const snapshot = await getDoc(paymentRef);

      if (snapshot.exists()) {
        const paymentData = snapshot.data();

        // Fetch user data
        // const userRef = doc(db, "users", paymentData.userId);
        // const userSnap = await getDoc(userRef);

        // const userData = userSnap.exists() ? userSnap.data() : {};

        setPayments([
          {
            id: snapshot.id,
            // userName: (userData.firstName || "") + " " + (userData.lastName || ""),
            userName : paymentData.name,
            userEmail : paymentData.email,
            Date: formatDate(paymentData.createdAt),
            ...paymentData,
          },
        ]);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error loading single payment:", err);
    }
    setLoading(false);
  };

  // Fetch First Page
  const fetchFirstPage = async () => {
    setLoading(true);

    try {
      const q = query(
        collection(db, "payments"),
        orderBy("paymentId"),
        limit(PAYMENTS_PER_PAGE)
      );

      const querySnapshot = await getDocs(q);

      const paymentList = [];
      for (let docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        // Fetch user profile for each payment
        // const userSnap = await getDoc(doc(db, "users", data.userId));
        // const userData = userSnap.exists() ? userSnap.data() : {};

        paymentList.push({
          id: docSnap.id,
          // userName: (userData.firstName || "") + " " + (userData.lastName || ""),
          userName : data.name,
          userEmail:data.email,
          Date: formatDate(data.createdAt),
          ...data,
        });
      }

      setPayments(paymentList);

      if (querySnapshot.docs.length > 0) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

      setIsFirstPage(true);
      setIsLastPage(querySnapshot.docs.length < PAYMENTS_PER_PAGE);
      setPageHistory([]);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }

    setLoading(false);
  };

  // Pagination - Next
  const handleNextPage = async () => {
    if (!lastVisible || isLastPage) return;
    setLoading(true);

    try {
      setPageHistory((prev) => [...prev, firstVisible]);

      const q = query(
        collection(db, "payments"),
        orderBy("paymentId"),
        startAfter(lastVisible),
        limit(PAYMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);

      const paymentList = [];
      for (let docSnap of snapshot.docs) {
        const data = docSnap.data();
        // const userSnap = await getDoc(doc(db, "users", data.userId));
        // const userData = userSnap.exists() ? userSnap.data() : {};

        paymentList.push({
          id: docSnap.id,
          userName: data.name,
          userEmail : data.email,
          Date: formatDate(data.createdAt),
          // userName: (userData.firstName || "") + " " + (userData.lastName || ""),
          ...data,
        });
      }

      setPayments(paymentList);
      setFirstVisible(snapshot.docs[0]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setIsFirstPage(false);
      setIsLastPage(snapshot.docs.length < PAYMENTS_PER_PAGE);
    } catch (err) {
      console.error("Next page error:", err);
    }

    setLoading(false);
  };

  // Pagination - Previous
  const handlePrevPage = async () => {
    if (isFirstPage || pageHistory.length === 0) return;
    setLoading(true);

    try {
      const newHistory = pageHistory.slice(0, -1);

      const q = query(
        collection(db, "payments"),
        orderBy("paymentId"),
        endBefore(firstVisible),
        limitToLast(PAYMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);

      const paymentList = [];
      for (let docSnap of snapshot.docs) {
        const data = docSnap.data();
        // const userSnap = await getDoc(doc(db, "users", data.userId));
        // const userData = userSnap.exists() ? userSnap.data() : {};

        paymentList.push({
          id: docSnap.id,
          userName: userAgent.name,
          userEmail: data.email,
          Date: formatDate(data.createdAt),
          // userName: (userData.firstName || "") + " " + (userData.lastName || ""),
          ...data,
        });
      }

      setPayments(paymentList);
      setFirstVisible(snapshot.docs[0]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setPageHistory(newHistory);
      setIsFirstPage(newHistory.length === 0);
      setIsLastPage(false);
    } catch (err) {
      console.error("Prev page error:", err);
    }

    setLoading(false);
  };

  // PDF Export
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const snapshot = await getDocs(collection(db, "payments"));

      const docFile = new jsPDF();
      docFile.text("Anwesha - Payment Report", 14, 20);

      const rows = [];

      for (let snap of snapshot.docs) {
        const data = snap.data();

        rows.push([
          data.email,
          data.name,
          data.paymentId,
          data.totalAmount,
           data.status,
           formatDate(data.createdAt),

        ]);
      }

      autoTable(docFile, {
        head: [["Email","Name", "Payment ID", "Amount", "Status","Date"]],
        body: rows,
        startY: 30,
      });

      docFile.save("payments_export.pdf");
    } catch (err) {
      console.error("PDF error:", err);
    }

    setDownloading(false);
  };

  // UI Loading Spinner
  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 sm:p-12">

      {/* Header */}
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-white">Payment Database</h2>
            <p className="text-slate-400 text-sm mt-1">All Anwesha Payments</p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-3 bg-red-600 rounded-xl"
          >
            {downloading ? "Generating..." : "Export PDF"}
          </button>
        </div>

        {/* Payment Table */}
        <table className="min-w-full mt-8 text-left">
          <thead>
            <tr className="text-xs uppercase text-slate-500 border-b border-slate-700">
              <th className="p-3">Payment ID</th>
              <th className="p-3">Order ID</th>
              <th className="p-3">UserName</th>
              <th className="p-3">UserEmail</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                <td className="p-3 font-mono text-blue-400">{p.paymentId}</td>
                <td className="p-3">{p.orderId}</td>
                <td className="p-3">{p.userName || "Unknown User"}</td>
                <td className="p-3">{p.userEmail || "Unknown Email"}</td>
                <td className="p-3 font-bold text-green-400">₹{p.totalAmount}</td>
                <td className="p-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/20 text-emerald-400"
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-3">{p.Date || "Unknown Date"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!paymentIdFromURL && (
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
        )}
      </div>
    </div>
  );
}
