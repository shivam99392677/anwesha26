"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Link from 'next/link';

export default function SendMailPage() {
  const [target, setTarget] = useState('all'); // 'all' or 'event'
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch Events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));
        const eventList = snap.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().Name || doc.data().name || "Unnamed Event" 
        }));
        setEvents(eventList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: target,
          eventId: selectedEvent,
          subject,
          message
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Success! Email sent to ${data.count} users.`);
        setSubject('');
        setMessage('');
      } else {
        alert("Failed: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full min-h-screen font-sans text-slate-200">
      
      {/* --- BACKGROUND (Matches AddEventPage) --- */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2000&auto=format&fit=crop" 
          alt="background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen py-12 px-4 sm:px-6">
        
        {/* --- NAVIGATION --- */}
        <div className="w-full max-w-4xl mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <Link 
             href="/admin" 
             className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-all duration-300 group"
           >
             <div className="p-3 rounded-full border border-slate-700 bg-slate-900/50 group-hover:bg-violet-600 group-hover:border-violet-500 transition-all shadow-lg">
               <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
             </div>
             <div>
                <span className="block text-xs font-bold tracking-widest uppercase text-slate-500 group-hover:text-violet-300">Dashboard</span>
                <span className="block text-lg font-bold text-slate-300 group-hover:text-white">Broadcast Center</span>
             </div>
           </Link>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-500">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
             <div>
               <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Comms Terminal</h2>
               <p className="text-violet-200/60 text-sm font-medium">Send priority updates to the community</p>
             </div>
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">System Ready</span>
             </div>
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSend} className="space-y-10">
              
              {/* SECTION A: Audience Selection */}
              <div>
                <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Select Target Audience</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Option 1: All Users */}
                  <div 
                    onClick={() => setTarget('all')}
                    className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                      target === 'all' 
                        ? 'bg-violet-600/20 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                        : 'bg-slate-800/40 border-white/10 hover:border-white/30 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-3 rounded-full ${target === 'all' ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Everyone</h3>
                        <p className="text-xs text-slate-400">Blast to all registered users</p>
                      </div>
                    </div>
                    {target === 'all' && <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent pointer-events-none" />}
                  </div>

                  {/* Option 2: Specific Event */}
                  <div 
                    onClick={() => setTarget('event')}
                    className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 ${
                      target === 'event' 
                        ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                        : 'bg-slate-800/40 border-white/10 hover:border-white/30 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`p-3 rounded-full ${target === 'event' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Event Specific</h3>
                        <p className="text-xs text-slate-400">Target participants of one event</p>
                      </div>
                    </div>
                    {target === 'event' && <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" />}
                  </div>

                </div>
              </div>

              {/* SECTION B: Event Dropdown (Conditional) */}
              {target === 'event' && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-500">
                  <div className="group relative">
                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 transition-colors">Select Event Context</label>
                    <div className="relative">
                      <select 
                        required={target === 'event'}
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="block w-full bg-transparent border-b border-slate-700 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/5 transition-all font-medium cursor-pointer appearance-none"
                      >
                        <option value="" className="bg-slate-900 text-slate-500">-- Choose Target Event --</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id} className="bg-slate-900 text-white">
                            {event.name} (ID: {event.id})
                          </option>
                        ))}
                      </select>
                      {/* Arrow Icon */}
                      <div className="absolute right-0 bottom-4 pointer-events-none text-blue-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-500 ease-out group-focus-within:w-full"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION C: Message Content */}
              <div className="space-y-8">
                <InputGroup 
                  label="Subject Line" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  placeholder="e.g. IMPORTANT: Schedule Change for Dance Competition" 
                />
                
                <div className="relative group">
                  <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-3 group-focus-within:text-violet-300 transition-colors">Message Body</label>
                  <textarea 
                    required
                    rows="6"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your official announcement here..."
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none shadow-inner font-mono text-sm leading-relaxed"
                  ></textarea>
                </div>
              </div>

              {/* SECTION D: Submit Button */}
              <div className="pt-4 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-white text-slate-950 py-4 rounded-xl font-bold tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>DISPATCHING...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        <span>LAUNCH BROADCAST</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-white to-violet-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component (Matches AddEventPage style)
const InputGroup = ({ label, value, onChange, placeholder }) => (
  <div className="group relative">
    <label className="block text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-violet-300">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        value={value} 
        onChange={onChange} 
        required
        className="block w-full bg-transparent border-b border-slate-700 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:bg-white/5 transition-all font-medium"
        placeholder={placeholder}
      />
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-violet-500 shadow-[0_0_10px_#8b5cf6] transition-all duration-500 ease-out group-focus-within:w-full"></div>
    </div>
  </div>
);