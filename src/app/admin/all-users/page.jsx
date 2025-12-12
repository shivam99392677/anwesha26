"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, limit, startAfter, endBefore, limitToLast } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig';
import Link from 'next/link';

// PDF LIBRARIES
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Pagination State
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [pageHistory, setPageHistory] = useState([]);
  
  const USERS_PER_PAGE = 10;

  useEffect(() => {
    fetchFirstPage();
  }, []);

  const fetchFirstPage = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("email"), limit(USERS_PER_PAGE));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setUsers(usersList);
      if (querySnapshot.docs.length > 0) {
        setFirstVisible(querySnapshot.docs[0]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      setIsFirstPage(true);
      setIsLastPage(querySnapshot.docs.length < USERS_PER_PAGE);
      setPageHistory([]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleNextPage = async () => {
     if (!lastVisible || isLastPage) return;
     setLoading(true);
     try {
       setPageHistory(prev => [...prev, firstVisible]);
       const q = query(collection(db, "users"), orderBy("email"), startAfter(lastVisible), limit(USERS_PER_PAGE));
       const querySnapshot = await getDocs(q);
       if (!querySnapshot.empty) {
         const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setUsers(usersList);
         setFirstVisible(querySnapshot.docs[0]);
         setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
         setIsFirstPage(false);
         setIsLastPage(querySnapshot.docs.length < USERS_PER_PAGE);
       } else {
         setIsLastPage(true);
       }
     } catch (error) {
       console.error("Error next page:", error);
     }
     setLoading(false);
  };

  const handlePrevPage = async () => {
    if (isFirstPage || pageHistory.length === 0) return;
    setLoading(true);
    try {
      const newHistory = pageHistory.slice(0, -1);
      const q = query(collection(db, "users"), orderBy("email"), endBefore(firstVisible), limitToLast(USERS_PER_PAGE));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
      setFirstVisible(querySnapshot.docs[0]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setPageHistory(newHistory);
      setIsFirstPage(newHistory.length === 0);
      setIsLastPage(false);
    } catch (error) {
      console.error("Error prev page:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (userId) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Anwesha 2025 - All Users Report", 14, 20);
      
      const tableColumn = ["First Name", "Last Name", "Email", "Anwesha ID", "Role", "College"];
      const tableRows = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        tableRows.push([
          data.firstName || '',
          data.lastName || '',
          data.email || '',
          data.anweshaId || 'N/A',
          data.role || 'user',
          data.college?.name || 'N/A',
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] } // Violet color for PDF header
      });

      doc.save(`anwesha_users_export.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
    setDownloading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    // 1. Main Background: Slate-950 (Dark)
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 sm:p-12 font-sans">
      
      {/* 2. Container Card: Slate-900 with subtle border */}
      <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">User Database</h2>
            <p className="text-slate-400 text-sm mt-1">Manage all registered participants.</p>
          </div>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 ${
              downloading 
                ? "bg-slate-700 cursor-not-allowed text-slate-400" 
                : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/20"
            }`}
          >
            {downloading ? (
              <>
                 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              {/* Dark Header */}
              <tr className="bg-slate-950/50 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="p-6">User Profile</th>
                <th className="p-6">Anwesha ID</th>
                <th className="p-6">Institution</th>
                <th className="p-6">Role</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="font-bold text-white text-base">{user.firstName} {user.lastName}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
                  </td>
                  <td className="p-6 font-mono text-blue-400">
                    {user.anweshaId || <span className="text-slate-600">N/A</span>}
                  </td>
                  <td className="p-6 text-slate-300">
                    {user.college?.name || "Unknown"}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                       user.role === 'admin' 
                         ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                         : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                      <div className="flex justify-end items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/users/${user.id}`}>
                              <div className="p-2 bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </div>
                          </Link>
                          <button onClick={() => handleDelete(user.id)} className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION (Dark Mode) */}
        <div className="flex justify-between items-center p-6 border-t border-slate-800 bg-slate-900/50">
          <span className="text-sm text-slate-500 font-medium">Page {pageHistory.length + 1}</span>
          <div className="flex gap-3">
              <button 
                  onClick={handlePrevPage} 
                  disabled={isFirstPage || loading}
                  className={`px-5 py-2 text-sm font-bold rounded-lg border transition-all ${
                    isFirstPage 
                      ? 'bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                  Previous
              </button>
              <button 
                  onClick={handleNextPage} 
                  disabled={isLastPage || loading}
                  className={`px-5 py-2 text-sm font-bold rounded-lg border transition-all ${
                    isLastPage 
                      ? 'bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
              >
                  Next
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}