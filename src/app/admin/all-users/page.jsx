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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Pagination State
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(false);
  const [pageHistory, setPageHistory] = useState([]);

  const USERS_PER_PAGE = 20;

  useEffect(() => {
    fetchFirstPage();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => {
        const fullName = `${user.personal?.firstName || ''} ${user.personal?.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const aid = (user.anweshaId || '').toLowerCase();
        const role = (user.role || '').toLowerCase();

        return fullName.includes(lowerSearch) || 
          email.includes(lowerSearch) || 
          aid.includes(lowerSearch) || 
          role.includes(lowerSearch);
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);


  const fetchFirstPage = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("email"), limit(USERS_PER_PAGE));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setUsers(usersList);
      setFilteredUsers(usersList);

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
        setFilteredUsers(usersList);
        setSearchTerm('');
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
      setFilteredUsers(usersList);
      setSearchTerm('');
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
      const updatedList = users.filter(u => u.id !== userId);
      setUsers(updatedList);
      if (searchTerm === '') {
        setFilteredUsers(updatedList);
      } else {
        setFilteredUsers(updatedList.filter(u => u.email.includes(searchTerm))); 
      }
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
          data.personal?.firstName || '',
          data.personal?.lastName || '',
          data.email || '',
          data.anweshaId || 'N/A',
          data.role || 'user',
          data.college?.name || 'N/A',
        ]);
      });
      autoTable(doc, {
        head: [tableColumn], body: tableRows, startY: 45, theme: 'grid', styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] }
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
    <div className="relative w-full min-h-screen font-sans text-slate-200">

      {/* Background Image Overlay (Copied from Dashboard) */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" 
          alt="background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 p-6 sm:p-12 max-w-7xl mx-auto">

        {/* Header Section (Copied Style from Dashboard) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
              User <span className="text-blue-500">Database</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Manage registered participants, roles, and profiles.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
             {/* PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 ${downloading
                  ? "bg-slate-800 cursor-not-allowed text-slate-500"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/20"
                }`}
            >
              {downloading ? (
                 <>Generating...</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Export PDF
                </>
              )}
            </button>
            
            <div className="px-5 py-2 rounded-full bg-slate-900/80 border border-slate-700 shadow-xl backdrop-blur-md">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="mb-8 relative group max-w-2xl">
          {/* FIX 1: Added 'z-10' so it sits on top of the input background */}
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
    {/* FIX 2: Changed 'text-slate-500' to 'text-slate-400' for better visibility */}
    {/* FIX 3: Changed invalid 'text-white-500' to 'text-blue-500' (or text-white) */}
    <svg 
      className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
          </div>
          <input
            type="text"
            placeholder="Search by Name, Anwesha ID, Role, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white-900/60 backdrop-blur-md border border-slate-700 text-white text-sm rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500 shadow-lg"
          />
        </div>

        {/* Glassmorphic Table Container */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-6">User Profile</th>
                  <th className="p-6">Anwesha ID</th>
                  <th className="p-6">Institution</th>
                  <th className="p-6">Role</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800/50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{user.personal?.firstName} {user.personal?.lastName}</div>
                        <div className="text-slate-500 text-xs mt-0.5 font-mono">{user.email}</div>
                      </td>
                      <td className="p-6 font-mono text-slate-300">
                        {user.anweshaId ? (
                           <span className="bg-slate-800/50 px-2 py-1 rounded text-blue-400 border border-slate-700/50 text-xs">
                             {user.anweshaId}
                           </span>
                        ) : <span className="text-slate-600">N/A</span>}
                      </td>
                      <td className="p-6 text-slate-400">
                        {user.college?.name || "Unknown"}
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                          {user.role || 'USER'}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/users/${user.id}`}>
                            <div className="p-2 bg-slate-800/50 border border-slate-700/50 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                          </Link>
                          <button onClick={() => handleDelete(user.id)} className="p-2 bg-slate-800/50 border border-slate-700/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-slate-500 italic">
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="flex justify-between items-center p-6 border-t border-slate-800/50 bg-slate-900/30">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              {searchTerm ? 'Showing Search Results' : `Page ${pageHistory.length + 1}`}
            </span>
            
            {!searchTerm && (
              <div className="flex gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={isFirstPage || loading}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${isFirstPage
                      ? 'bg-slate-800/30 text-slate-600 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={isLastPage || loading}
                  className={`px-4 py-2 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${isLastPage
                      ? 'bg-slate-800/30 text-slate-600 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}