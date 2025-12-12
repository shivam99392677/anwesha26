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
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function AllCAPage() {
  const [caList, setCaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [pageHistory, setPageHistory] = useState([]);

  const CA_PER_PAGE = 10;

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchUserId = searchParams.get("userId");

  useEffect(() => {
    if (searchUserId) {
      fetchSingleCA(searchUserId);
    } else {
      fetchFirstPage();
    }
  }, [searchUserId]);

  // Fetch single CA by userId
  const fetchSingleCA = async (userId) => {
    setLoading(true);
    try {
      const caRef = doc(db, "ca", userId);
      const snap = await getDoc(caRef);

      if (snap.exists()) {
        setCaList([
          {
            id: snap.id,
            ...snap.data(),
          },
        ]);
      } else {
        setCaList([]);
      }
    } catch (err) {
      console.error("Error fetching CA:", err);
    }
    setLoading(false);
  };

  // Fetch first page
  const fetchFirstPage = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, "ca"), orderBy("registeredAt", "desc"), limit(CA_PER_PAGE));

      const snap = await getDocs(q);
      const caArray = snap.docs.map((x) => ({ id: x.id, ...x.data() }));

      setCaList(caArray);

      if (snap.docs.length > 0) {
        setFirstVisible(snap.docs[0]);
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }

      setIsFirstPage(true);
      setIsLastPage(snap.docs.length < CA_PER_PAGE);
      setPageHistory([]);
    } catch (err) {
      console.error("Error loading CA list:", err);
    }

    setLoading(false);
  };

  // NEXT page
  const handleNextPage = async () => {
    if (!lastVisible || isLastPage) return;
    setLoading(true);

    try {
      setPageHistory((prev) => [...prev, firstVisible]);

      const q = query(
        collection(db, "ca"),
        orderBy("registeredAt", "desc"),
        startAfter(lastVisible),
        limit(CA_PER_PAGE)
      );

      const snap = await getDocs(q);

      const caArray = snap.docs.map((x) => ({ id: x.id, ...x.data() }));

      setCaList(caArray);
      setFirstVisible(snap.docs[0]);
      setLastVisible(snap.docs[snap.docs.length - 1]);
      setIsFirstPage(false);
      setIsLastPage(snap.docs.length < CA_PER_PAGE);
    } catch (err) {
      console.error("Next page error:", err);
    }

    setLoading(false);
  };

  // PREVIOUS page
  const handlePrevPage = async () => {
    if (isFirstPage || pageHistory.length === 0) return;
    setLoading(true);

    try {
      const newHistory = pageHistory.slice(0, -1);

      const q = query(
        collection(db, "ca"),
        orderBy("registeredAt", "desc"),
        endBefore(firstVisible),
        limitToLast(CA_PER_PAGE)
      );

      const snap = await getDocs(q);
      const caArray = snap.docs.map((x) => ({ id: x.id, ...x.data() }));

      setCaList(caArray);
      setFirstVisible(snap.docs[0]);
      setLastVisible(snap.docs[snap.docs.length - 1]);
      setPageHistory(newHistory);
      setIsFirstPage(newHistory.length === 0);
      setIsLastPage(false);
    } catch (err) {
      console.error("Prev page error:", err);
    }

    setLoading(false);
  };

  // LOADING SCREEN
  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12">
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8">

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">Campus Ambassador Database</h2>
            <p className="text-slate-400 text-sm mt-1">All Registered CA</p>
          </div>
        </div>

        {/* CA Table */}
        <table className="min-w-full mt-8 text-left">
          <thead>
            <tr className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Anwesha ID</th>
              <th className="p-3">College</th>
              <th className="p-3">Registered At</th>
            </tr>
          </thead>

          <tbody>
            {caList.map((ca) => (
              <tr
                key={ca.id}
                className="border-b border-slate-800 hover:bg-slate-800/40 cursor-pointer"
                onClick={() => router.push(`/admin/ca/${ca.id}`)}
              >
                <td className="p-3 font-bold">{ca.name}</td>
                <td className="p-3">{ca.email}</td>
                <td className="p-3">{ca.phone}</td>
                <td className="p-3 font-mono text-blue-400">{ca.anweshaId}</td>
                <td className="p-3">{ca.college}</td>
                <td className="p-3 text-slate-400">
                  {new Date(ca.registeredAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!searchUserId && (
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
