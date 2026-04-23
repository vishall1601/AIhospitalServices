import React, { useState } from 'react';
import { Search, MapPin, Phone, Star, Building2, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DELHI_HOSPITALS = [
  { id: 'h1', name: 'AIIMS Delhi', type: 'Government', locality: 'Ansari Nagar', rating: 4.8, contact: '011-26588500', specialty: ['Multispecialty', 'Research'] },
  { id: 'h2', name: 'Safdarjung Hospital', type: 'Government', locality: 'Safdarjung Enclave', rating: 4.2, contact: '011-26707100', specialty: ['Multispecialty', 'Emergency'] },
  { id: 'h3', name: 'Max Super Speciality Hospital', type: 'Private', locality: 'Saket', rating: 4.5, contact: '011-26515050', specialty: ['Cardiac', 'Oncology', 'Neurology'] },
  { id: 'h4', name: 'Fortis Escorts Heart Institute', type: 'Private', locality: 'Okhla', rating: 4.6, contact: '011-47135000', specialty: ['Cardiac', 'Vascular'] },
  { id: 'h5', name: 'Indraprastha Apollo Hospital', type: 'Private', locality: 'Sarita Vihar', rating: 4.4, contact: '011-71791090', specialty: ['Transplant', 'Cardiology'] },
  { id: 'h6', name: 'Sir Ganga Ram Hospital', type: 'Private', locality: 'Old Rajinder Nagar', rating: 4.3, contact: '011-25750000', specialty: ['Nephrology', 'Gastroenterology'] },
];

export const HospitalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Government' | 'Private'>('All');
  const [bookingFor, setBookingFor] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const filteredHospitals = DELHI_HOSPITALS.filter(h => 
    (h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.locality.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filter === 'All' || h.type === filter)
  );

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return alert('Please login to book appointments');
    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'appointments'), {
        userId: auth.currentUser.uid,
        hospitalName: bookingFor.name,
        hospitalId: bookingFor.id,
        appointmentDate: serverTimestamp(),
        status: 'pending',
        doctorName: 'Dr. Expert (AI Assigned)',
      });
      setBookingStatus('success');
      setTimeout(() => {
        setBookingStatus('idle');
        setBookingFor(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      setBookingStatus('idle');
    }
  };

  return (
    <div className="space-y-6" id="hospital-search">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search hospitals in Delhi..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
          {['All', 'Government', 'Private'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                filter === f ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50'
              } cursor-pointer`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital, idx) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-2.5 rounded-xl ${hospital.type === 'Government' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                <Building2 size={20} />
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-slate-700">{hospital.rating}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{hospital.name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
              <MapPin size={12} />
              <span>{hospital.locality}, Delhi</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {hospital.specialty.map(s => (
                <span key={s} className="text-[9px] uppercase tracking-widest font-black bg-slate-50 px-2 py-1 rounded text-slate-500 border border-slate-100">
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-auto">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-tight">
                <Phone size={12} />
                <span>{hospital.contact}</span>
              </div>
              <button 
                onClick={() => setBookingFor(hospital)}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all cursor-pointer shadow-sm"
                title="Book Appointment"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {bookingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBookingFor(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold font-display mb-2">Book Appointment</h3>
            <p className="text-sm text-gray-500 mb-6">Confirm your visit to <span className="font-bold text-sky-600">{bookingFor.name}</span></p>
            
            {bookingStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={24} fill="currentColor" />
                </div>
                <h4 className="text-xl font-bold text-emerald-900">Request Sent!</h4>
                <p className="text-sm text-emerald-600">The hospital will contact you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Patient Name</label>
                  <input type="text" defaultValue={auth.currentUser?.displayName || ''} className="w-full bg-gray-100 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preferred Date</label>
                  <input type="date" className="w-full bg-gray-100 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500" required />
                </div>
                <button 
                  disabled={bookingStatus === 'loading'}
                  className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl hover:bg-sky-700 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-sky-100"
                >
                  {bookingStatus === 'loading' ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
