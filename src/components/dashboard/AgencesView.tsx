'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Users, QrCode, Layers, MapPin, Mail, Phone,
  Loader2, X, CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface Agency {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  tagCount: number;
  batchCount: number;
  userCount: number;
  createdAt: string;
}

export default function AgencesView() {
  const { token } = useAuthStore();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAgencies = useCallback(async () => {
    const res = await fetch('/api/agencies', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const d = await res.json();
    if (d.agencies) setAgencies(d.agencies);
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchAgencies(); }, [fetchAgencies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/agencies', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: formName, email: formEmail, phone: formPhone, city: formCity, country: formCountry }),
      });
      const d = await res.json();
      if (res.ok && d.success) { setSuccess(`Agence "${d.agency.name}" créée !`); setFormName(''); setFormEmail(''); setFormPhone(''); setFormCity(''); setFormCountry(''); setShowForm(false); fetchAgencies(); }
      else setError(d.error || 'Erreur');
    } catch { setError('Erreur réseau'); }
    setCreating(false);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion des Agences</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agencies.length} agence{agencies.length > 1 ? 's' : ''} enregistrée{agencies.length > 1 ? 's' : ''}</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition shadow-lg min-h-[44px]">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Annuler' : 'Nouvelle agence'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Créer une agence</h3>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom *</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Nom de l'agence"
                className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="contact@agence.com"
                className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone</label>
              <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+33 1 23 45 67 89"
                className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
              <input type="text" value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="Paris"
                className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pays</label>
              <input type="text" value={formCountry} onChange={(e) => setFormCountry(e.target.value)} placeholder="France"
                className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={creating || !formName.trim()}
                className="w-full min-h-[44px] rounded-xl font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#7C3AED' }}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Créer</>}
              </button>
            </div>
          </form>
          {error && <p className="text-sm text-red-600 mt-3 font-medium">{error}</p>}
          {success && <p className="text-sm text-emerald-600 mt-3 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {success}</p>}
        </motion.div>
      )}

      {/* Agency cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agencies.map((agency, i) => (
          <motion.div key={agency.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{agency.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  agency.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>{agency.status === 'active' ? 'Active' : agency.status}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {(agency.city || agency.country) && (
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" />{[agency.city, agency.country].filter(Boolean).join(', ')}</div>
              )}
              {agency.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" />{agency.email}</div>}
              {agency.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{agency.phone}</div>}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">{agency.tagCount}</p>
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><QrCode className="w-3 h-3" />Tags</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">{agency.batchCount}</p>
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Layers className="w-3 h-3" />Lots</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900">{agency.userCount}</p>
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Users className="w-3 h-3" />Users</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
