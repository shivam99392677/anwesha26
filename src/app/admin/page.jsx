"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  // State for the Stats Cards
  const [statsData, setStatsData] = useState({
    users: 0,
    events: 0,
    orders: 0,
    products: 0
  });

  // State for Recent Activity
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Define Collections
        const usersColl = collection(db, "users");
        const eventsColl = collection(db, "events");
        const ordersColl = collection(db, "orders");
        const productsColl = collection(db, "products");

        // 2. Fetch Counts in Parallel
        const [userSnap, eventSnap, orderSnap, productSnap] = await Promise.all([
          getCountFromServer(usersColl),
          getCountFromServer(eventsColl),
          getCountFromServer(ordersColl),
          getCountFromServer(productsColl)
        ]);

        // 3. Fetch Recent Activity
        const q = query(usersColl, orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(q);
        
        const recentList = recentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 4. Update State
        setStatsData({
          users: userSnap.data().count,
          events: eventSnap.data().count,
          orders: orderSnap.data().count,
          products: productSnap.data().count
        });
        setRecentUsers(recentList);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const stats = [
    { 
      label: "Total Users", 
      value: statsData.users.toLocaleString(), 
      color: "text-blue-400", 
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> 
    },
    { 
      label: "Total Events", 
      value: statsData.events.toLocaleString(), 
      color: "text-purple-400", 
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> 
    },
    { 
      label: "Total Orders", 
      value: statsData.orders.toLocaleString(), 
      color: "text-emerald-400", 
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 
    },
    { 
      label: "Total Products", 
      value: statsData.products.toLocaleString(), 
      color: "text-rose-400", 
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg> 
    },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen font-sans text-slate-200">
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" 
          alt="background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 p-6 sm:p-12 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
              Dashboard <span className="text-blue-500">Overview</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Welcome back, Admin. System performance at a glance.
            </p>
          </div>
          <div className="px-5 py-2 rounded-full bg-slate-900/80 border border-slate-700 shadow-xl backdrop-blur-md">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-slate-600 transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} ${stat.border} border shadow-lg group-hover:shadow-${stat.color}/20 transition-all`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity Column */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Registrations
              </h2>
              <Link href="/admin/all-users" className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10">
                View All Users
              </Link>
            </div>
            
            <div className="space-y-6">
              {recentUsers.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 italic">No recent activity found.</div>
              ) : (
                  recentUsers.map((user, i) => (
                  <div key={user.id} className="relative pl-6 border-l border-slate-800 hover:border-blue-500/50 transition-colors group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-slate-900 group-hover:bg-blue-500 transition-colors"></div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-slate-200 font-medium group-hover:text-white transition-colors">
                              <span className="font-bold">{user.firstName} {user.lastName}</span> joined from <span className="text-blue-400">{user.college?.name || "Unknown"}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-mono">
                              {user.email}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {formatTime(user.createdAt)}
                        </span>
                      </div>
                  </div>
                  ))
              )}
            </div>
          </div>

          {/* Quick Actions Column */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href="/admin/add-event" 
                  className="group flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                >
                  <span className="flex items-center gap-2 group-hover:-translate-y-0.5 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    Create New Event
                  </span>
                </Link>
                
                <Link 
                  href="/admin/all-users" 
                  className="flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3.5 rounded-xl transition-all"
                >
                  Manage Users
                </Link>
                
                <button className="w-full bg-slate-950 border border-dashed border-slate-800 text-slate-600 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download Reports
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute opacity-75"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">System Operational</h4>
                <p className="text-xs text-emerald-400 mt-0.5">Firebase Connected</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}