'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Loader2, FileText, Download, Package, Heart, Calendar,
  Building2, CheckCircle2, AlertCircle, X, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

const PACKS = [
  { id: 'pratique' as PackType, title: 'Pratique', subtitle: 'Objets perdus', color: '#E3B23C', icon: <Package className="w-4 h-4" /> },
  { id: 'emotion' as PackType, title: 'Émotion', subtitle: 'Messages', color: '#7C3AED', icon: <Heart className="w-4 h-4" /> },
  { id: 'evenementiel' as PackType, title: 'Événementiel', subtitle: "Livre d'or", color: '#059669', icon: <Calendar className="w-4 h-4" /> },
  { id: 'immobilier' as PackType, title: 'Immobilier', subtitle: 'Fiches biens', color: '#475569', icon: <Building2 className="w-4 h-4" /> },
];

interface Batch {
  id: string; name: string; packType: string; quantity: number; tagCount: number;
  statusCounts: Record<string, number>; status: string; createdAt: string;
}

export default function LotsView() {
  const { token } = useAuthStore();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchName, setBatchName] = useState('');
  const [batchPackType, setBatchPackType] = useState<PackType>('pratique');
  const [batchQuantity, setBatchQuantity] = useState(16);
  const [batchCreating, setBatchCreating] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState('');
  const [batchError, setBatchError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTags, setExpandedTags] = useState<Array<{ reference: string; status: string }>>([]);
  const [expandedLoading, setExpandedLoading] = useState(false);

  const fetchBatches = useCallback(async () => {
    setBatchesLoading(true);
    const res = await fetch('/api/batches', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const d = await res.json();
    if (d.batches) setBatches(d.batches);
    setBatchesLoading(false);
  }, [token]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchCreating(true); setBatchSuccess(''); setBatchError('');
    try {
      const res = await fetch('/api/batches', {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: batchName, packType: batchPackType, quantity: batchQuantity }),
      });
      const d = await res.json();
      if (res.ok && d.success) { setBatchSuccess(d.message); setBatchName(''); fetchBatches(); }
      else setBatchError(d.error || 'Erreur');
    } catch { setBatchError('Erreur réseau'); }
    setBatchCreating(false);
  };

  const handleExpand = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); setExpandedTags([]); return; }
    setExpandedId(id); setExpandedLoading(true);
    try {
      const r = await fetch(`/api/batches/${id}/tags`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (r.ok) { const d = await r.json(); setExpandedTags(d.tags || []); }
    } catch { /* ignore */ }
    setExpandedLoading(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Gestion des Lots</h1>
          <p className="text-sm text-gray-500 mt-0.5">Génération en masse de QR codes par lot</p>
        </div>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-violet-500" /> Nouveau lot</h3>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du lot *</label>
            <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} required placeholder="Ex: Lot Voyageurs Janvier"
              className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition" />
          </div>
          <div className="w-48">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pack</label>
            <div className="flex gap-1">
              {PACKS.map((p) => (
                <button key={p.id} type="button" onClick={() => setBatchPackType(p.id)}
                  className={`flex-1 min-h-[44px] rounded-xl text-xs font-bold transition ${
                    batchPackType === p.id ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`} title={p.title}>
                  <div className="flex justify-center">{p.icon}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="w-32">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Quantité</label>
            <input type="number" min={1} max={500} value={batchQuantity} onChange={(e) => setBatchQuantity(Number(e.target.value))}
              className="w-full min-h-[44px] px-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm text-center font-bold focus:outline-none focus:border-purple-500 transition" />
          </div>
          <button type="submit" disabled={batchCreating || !batchName.trim()}
            className="px-6 min-h-[44px] rounded-xl font-bold text-white transition flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#7C3AED' }}>
            {batchCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Générer</>}
          </button>
        </form>
        <AnimatePresence>
          {batchSuccess && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{batchSuccess}</motion.div>}
          {batchError && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />{batchError}</motion.div>}
        </AnimatePresence>
      </div>

      {/* Batches list */}
      {batchesLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-200 rounded-2xl h-20 animate-pulse" />)}</div>
      ) : batches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Layers className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Aucun lot généré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch, i) => {
            const packInfo = PACKS.find((p) => p.id === batch.packType);
            const isExp = expandedId === batch.id;
            return (
              <motion.div key={batch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => handleExpand(batch.id)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (packInfo?.color || '#999') + '15', color: packInfo?.color || '#999' }}>
                    {packInfo?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{batch.name}</p>
                    <p className="text-xs text-gray-400">{batch.tagCount} tags · {packInfo?.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${batch.status === 'generated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {batch.status}
                    </span>
                    <a href={`/api/batches/${batch.id}/pdf`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700" title="Télécharger PDF"><FileText className="w-4 h-4" /></a>
                    <a href={`/api/batches/${batch.id}/csv`} download onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700" title="Télécharger CSV"><Download className="w-4 h-4" /></a>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <AnimatePresence>
                  {isExp && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 ml-14">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
                          {expandedLoading ? <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> :
                            expandedTags.length === 0 ? <p className="text-xs text-gray-400">Aucun tag</p> :
                              <div className="flex flex-wrap gap-1.5">
                                {expandedTags.map((tag) => (
                                  <span key={tag.reference} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold ${tag.status === 'activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${tag.status === 'activated' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                    {tag.reference}
                                  </span>
                                ))}
                              </div>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
