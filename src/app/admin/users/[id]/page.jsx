"use client";
import { useState, useEffect, use } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '@/lib/firebaseConfig';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditUserPage({ params }) {
  // Unwrap params (Next.js 15+ requirement)
  const { id: userId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    anweshaId: '',
    role: 'user',
    collegeName: ''
  });

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            firstName: data.personal.firstName || '',
            lastName: data.personal.lastName || '',
            email: data.email || '',
            anweshaId: data.anweshaId || '',
            role: data.role || 'user',
            collegeName: data.college?.name || ''
          });
        } else {
          alert("User not found!");
          router.push('/admin/all-users');
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, router]);

  // 2. Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, "users", userId);
      await updateDoc(docRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        anweshaId: formData.anweshaId,
        "college.name": formData.collegeName 
      });

      alert("User updated successfully!");
      router.push('/admin/all-users');
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative w-full min-h-screen text-slate-200 font-sans">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" 
          alt="background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6">
        
        {/* Navigation Back */}
        <div className="w-full max-w-3xl mb-6">
           <Link href="/admin/all-users" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm font-bold uppercase tracking-wider group">
             <span className="p-2 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
             </span>
             Back to Users List
           </Link>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Edit Profile</h1>
                <p className="text-blue-400 font-mono text-xs mt-1">ID: {userId}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {formData.firstName.charAt(0)}
            </div>
          </div>

          <div className="p-8 md:p-10">
            <form onSubmit={handleUpdate} className="space-y-8">
              
              {/* Row 1: Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>

              {/* Row 2: Identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative opacity-70">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email (Locked)</label>
                    <input type="email" value={formData.email} disabled className="block w-full bg-slate-950 border border-slate-800 py-3 px-4 rounded-xl text-slate-400 font-mono cursor-not-allowed" />
                </div>
                <InputGroup label="Anwesha ID" name="anweshaId" value={formData.anweshaId} onChange={handleChange} />
              </div>

              {/* Row 3: College */}
              <InputGroup label="College / Institution" name="collegeName" value={formData.collegeName} onChange={handleChange} />

              {/* Row 4: Role Selector */}
              <div className="relative group">
                <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 group-hover:text-blue-300 transition-colors">Access Role</label>
                <div className="relative">
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full appearance-none bg-slate-800 border border-slate-700 py-3 px-4 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer hover:bg-slate-700"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        {/* <option value="campus_ambassador">Campus Ambassador</option> */}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
                {formData.role === 'admin' && (
                    <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Warning: Admin access grants full control over this panel.
                    </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/all-users')}
                  className="px-8 py-4 border border-slate-700 rounded-xl text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Dark Input Component
const InputGroup = ({ label, name, value, onChange }) => (
  <div className="group relative">
    <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-300">{label}</label>
    <input 
      type="text" 
      name={name} 
      value={value} 
      onChange={onChange} 
      className="block w-full bg-slate-800 border border-slate-700 py-3 px-4 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
    />
  </div>
);