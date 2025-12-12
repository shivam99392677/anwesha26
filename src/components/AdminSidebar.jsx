"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = () => {
    const pathname = usePathname();

    // Helper function to style active vs inactive links
    const getLinkClass = (path) => {
        const isActive = pathname === path;
        return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1"
            : "text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"
            }`;
    };

    return (
        <aside className="w-72 bg-slate-900 h-screen sticky top-0 flex flex-col border-r border-slate-800 shadow-2xl z-50 mt-[4rem]" >

            {/* --- HEADER / LOGO --- */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    A
                </div>
                <div>
                    <h2 className="text-white font-bold text-lg tracking-wide">Anwesha Admin</h2>
                    <p className="text-xs text-slate-500">Management Console</p>
                </div>
            </div>

            {/* --- NAVIGATION --- */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">

                {/* DASHBOARD */}
                <div className="mb-2">
                    <Link href="/admin" className={getLinkClass("/admin")}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        <span>Dashboard</span>
                    </Link>
                </div>

                {/* USERS SECTION */}
                <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    User Management
                </div>
                <ul className="space-y-1">
                    <li>
                        <Link href="/admin/all-users" className={getLinkClass("/admin/all-users")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <span>All Users</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/all-ca" className={getLinkClass("/admin/all-ca")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>Campus Ambassador</span>
                        </Link>
                    </li>
                </ul>

                {/* EVENTS SECTION */}
                <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Events & Activities
                </div>
                <ul className="space-y-1">
                    <li>
                        <Link href="/admin/all-events" className={getLinkClass("/admin/all-events")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>All Events</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/add-event" className={getLinkClass("/admin/add-event")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>Add Event</span>
                        </Link>
                    </li>
                </ul>

                {/* payments  */}
                <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Payments
                </div>
                <ul className="space-y-1">
                    <li>
                        <Link href="/admin/all-payments" className={getLinkClass("/admin/all-payments")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>All Payments</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/all-store-orders" className={getLinkClass("/admin/all-store-orders")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>All Store Orders</span>
                        </Link>
                    </li>
                </ul>

                {/* COMMUNICATION SECTION */}
                <div className="mt-8 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Communication
                </div>
                <Link href="/admin/send-mail" className={getLinkClass("/admin/send-mail")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span>Broadcast Mail</span>
                </Link>
                {/* STORE SECTION */}
                <div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Merchandise Store
                </div>
                <ul className="space-y-1">
                    <li>
                        <Link href="/admin/all-products" className={getLinkClass("/admin/all-products")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            <span>All Products</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/upload-products" className={getLinkClass("/admin/upload-products")}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            <span>Add Product</span>
                        </Link>
                    </li>
                </ul>

            </nav>


            {/* --- FOOTER / LOGOUT --- */}
            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-200 group">
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>

        </aside>
    );
};

export default AdminSidebar;