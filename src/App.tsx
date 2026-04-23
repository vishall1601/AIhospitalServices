import React, { useState, useEffect } from 'react';
import { AuthStatus } from './components/Auth';
import { AIChat } from './components/AIChat';
import { HospitalSearch } from './components/HospitalSearch';
import { Dashboard } from './components/Dashboard';
import { auth } from './lib/firebase';
import { Heart, Stethoscope, Hospital, Activity, MessageCircle, ChevronRight, Menu, X, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'home' | 'chat' | 'hospitals' | 'dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const NavItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
        activeTab === id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'
      } cursor-pointer group`}
      id={`tab-${id}`}
    >
      <Icon size={20} className={activeTab === id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
      <span>{label}</span>
      {activeTab === id && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 shrink-0 z-50">
        <div className="flex items-center gap-2 mb-10 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">Swasthya<span className="text-blue-600">AI</span></span>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem id="home" icon={Activity} label="Dashboard" />
          <NavItem id="chat" icon={MessageCircle} label="Arogya AI Assistant" />
          <NavItem id="hospitals" icon={Hospital} label="Delhi Hospitals" />
          <NavItem id="dashboard" icon={Stethoscope} label="Health Records" />
        </nav>

        <div className="mt-auto space-y-4">
          <AuthStatus />
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg shadow-slate-900/20">
            <p className="text-[10px] opacity-70 uppercase font-bold mb-1 tracking-wider">Emergency Delhi</p>
            <p className="text-lg font-bold">102 / 112</p>
            <button className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              SOS Signal
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'home' ? `Welcome, ${user?.displayName?.split(' ')[0] || 'Health Seeker'}` : 
               activeTab === 'chat' ? 'Arogya AI Assistant' :
               activeTab === 'hospitals' ? 'Hospital Registry' : 'Your Health Data'}
            </h1>
            <p className="text-slate-500 text-sm">
              Delhi, India • <span className="text-green-600 font-medium tracking-tight flex-inline items-center gap-1">System Secure & Encrypted</span>
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Health Score</span>
              <span className="text-lg font-bold text-blue-600">84/100</span>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-slate-300" />
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* Hero Stat cards like footer in design */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                    <Heart size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Heart Rate</p>
                    <p className="text-xl font-bold text-slate-900">72 BPM</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-4 shadow-sm">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Activity</p>
                    <p className="text-xl font-bold text-slate-900">6,420 steps</p>
                  </div>
                </div>
                <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <CreditCard size={48} />
                  </div>
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <CreditCard size={14} /> Financial Wellness
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <span className="text-xs font-medium">HDFC Card</span>
                      <span className="text-[10px] bg-amber-400 text-blue-900 px-1.5 py-0.5 rounded font-bold">15% OFF</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-blue-200">View card specialized hospital discounts</p>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Dashboard />
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto flex flex-col h-full">
                <AIChat />
              </motion.div>
            )}
            {activeTab === 'hospitals' && (
              <motion.div key="hospitals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <HospitalSearch />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div key="records" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Dashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest leading-none">
            Swasthya Delhi • Powered by ArogyaAI Security
          </p>
        </footer>
      </main>
    </div>
  );
}
