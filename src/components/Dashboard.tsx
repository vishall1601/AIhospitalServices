import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { medicalModel } from '../lib/gemini';
import { Activity, ShieldCheck, CreditCard, TrendingUp, AlertTriangle, Plus, FileText, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const CARD_OFFERS = [
  { bank: 'HDFC Bank', card: 'Regalia/Dinners', discount: '15%', hospital: 'Max Healthcare' },
  { bank: 'ICICI Bank', card: 'Sapphiro/Rubyx', discount: '20%', hospital: 'Fortis' },
  { bank: 'SBI Card', card: 'Prime/Elite', discount: '10%', hospital: 'Apollo' },
];

const GOV_SCHEMES = [
  { name: 'Ayushman Bharat (PM-JAY)', benefit: '₹5 Lakh per family/year', eligibility: 'EWS/Vulnerable families' },
  { name: 'Delhi Arogya Kosh (DAK)', benefit: 'Free diagnostic/surgery', eligibility: 'Delhi Residents' },
];

export const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymptom, setNewSymptom] = useState('');

  const fetchRecords = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    const q = query(collection(db, 'users', auth.currentUser.uid, 'healthRecords'), orderBy('date', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecords(data);
    setLoading(false);

    if (data.length > 0) {
      setAnalyzing(true);
      const aiSummary = await medicalModel.analyzeHealthData(data);
      setSummary(aiSummary);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const addRecord = async () => {
    if (!auth.currentUser || !newSymptom) return;
    const recordsRef = collection(db, 'users', auth.currentUser.uid, 'healthRecords');
    await addDoc(recordsRef, {
      userId: auth.currentUser.uid,
      date: serverTimestamp(),
      symptoms: [newSymptom],
      vitals: { bp: '120/80', weight: 70 }
    });
    setNewSymptom('');
    setShowAddModal(false);
    fetchRecords();
  };

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-300" id="dashboard-login-prompt">
        <ShieldCheck size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Please login to view your health dashboard and secure data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Top Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Health Overview</h2>
          <p className="text-slate-500 text-sm italic">Secure medical data storage</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2"
          id="add-health-entry-button"
        >
          <Plus size={16} /> Log Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Personalized Insights</h3>
            </div>
            
            {analyzing ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Analyzing Trends...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                  {summary}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-400 text-sm">Add data to unlock AI reports.</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Recent Activity
            </h3>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
            ) : records.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {records.map((record) => (
                  <div key={record.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-900 text-sm">
                        {record.date?.toDate ? record.date.toDate().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Processing...'}
                      </p>
                      <div className="text-right">
                        <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-bold tracking-tight">BP: {record.vitals?.bp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors truncate">{record.symptoms?.join(', ') || 'General Checkup'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-12 text-slate-300 italic text-sm">No historical records found.</p>
            )}
          </div>
        </div>

        {/* Info Panels */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard size={48} />
            </div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wider opacity-90">Financial Wellness</h3>
            <div className="space-y-2">
              {CARD_OFFERS.map((offer, i) => (
                <div key={i} className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-tight">{offer.bank}</p>
                    <p className="text-xs font-semibold truncate max-w-[120px]">{offer.hospital}</p>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-blue-900 px-2 py-0.5 rounded font-bold">{offer.discount} OFF</span>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full bg-white text-blue-900 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-sm">View More Offers</button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold mb-4 text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-600" /> Government Schemes
            </h3>
            <div className="space-y-3">
              {GOV_SCHEMES.map((scheme, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-bold text-slate-800 text-xs">{scheme.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-green-600 font-bold uppercase">{scheme.benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold font-display mb-6">Log Health Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">How are you feeling?</label>
                <textarea 
                  className="w-full bg-gray-100 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="E.g. Mild headache, fatigue since morning..."
                  rows={4}
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Blood Pressure</label>
                  <input type="text" placeholder="120/80" className="w-full bg-gray-100 border-none rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Weight (kg)</label>
                  <input type="number" placeholder="70" className="w-full bg-gray-100 border-none rounded-xl p-3 text-sm" />
                </div>
              </div>
              <button 
                onClick={addRecord}
                className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl hover:bg-sky-700 transition-all mt-4 cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
