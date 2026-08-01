'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Plus, Loader2, Download, FileText, Package, Heart,
  Calendar, Building2, CheckCircle2, AlertCircle, X, Sparkles,
  Copy, Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

const PACKS: Array<{ id: PackType; title: string; subtitle: string; color: string; gradient: string; icon: React.ReactNode; desc: string }> = [
  { id: 'pratique', title: 'Pratique', subtitle: 'Objets perdus', color: '#D97706', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', icon: <Package className="w-6 h-6" />, desc: 'Bagages & étiquettes voyage' },
  { id: 'emotion', title: 'Émotion', subtitle: 'Messages', color: '#7C3AED', gradient: 'linear-gradient(135deg, #A855F7, #7C3AED)', icon: <Heart className="w-6 h-6" />, desc: 'Souvenirs & témoignages' },
  { id: 'evenementiel', title: 'Événementiel', subtitle: "Livre d'or", color: '#059669', gradient: 'linear-gradient(135deg, #10B981, #059669)', icon: <Calendar className="w-6 h-6" />, desc: 'Weddings & conférences' },
  { id: 'immobilier', title: 'Immobilier', subtitle: 'Fiches biens', color: '#475569', gradient: 'linear-gradient(135deg, #64748B, #475569)', icon: <Building2 className="w-6 h-6" />, desc: 'Visites & annonces' },
];

interface GeneratedTag {
  reference: string;
  status: string;
}

export default function QRGenerator() {
  const { token } = useAuthStore();
  const [step, setStep] = useState<'config' | 'result'>('config');
  const [selectedPack, setSelectedPack] = useState<PackType>('pratique');
  const [batchName, setBatchName] = useState('');
  const [quantity, setQuantity] = useState(8);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [batchId, setBatchId] = useState('');
  const [tags, setTags] = useState<GeneratedTag[]>([]);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const pack = PACKS.find((p) => p.id === selectedPack)!;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ name: batchName, packType: selectedPack, quantity }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setBatchId(d.batch.id);
        setTags(d.batch.references.map((r: string) => ({ reference: r, status: 'in_stock' })));
        setStep('result');
      } else {
        setError(d.error || 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    }
    setCreating(false);
  };

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleReset = () => {
    setStep('config');
    setBatchName('');
    setTags([]);
    setBatchId('');
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">Générateur de QR Codes</h3>
            <p className="text-xs text-gray-400">Créez et visualisez vos QR codes instantanément</p>
          </div>
        </div>
        {step === 'result' && (
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">
            <Plus className="w-3.5 h-3.5" /> Nouveau lot
          </button>
        )}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 'config' ? (
            <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <form onSubmit={handleGenerate}>
                {/* Pack selector */}
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Choisir un Pack</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {PACKS.map((p) => {
                    const isActive = selectedPack === p.id;
                    return (
                      <button key={p.id} type="button" onClick={() => setSelectedPack(p.id)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                          isActive ? 'border-transparent shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        style={isActive ? { borderColor: p.color, boxShadow: `0 4px 20px ${p.color}30` } : {}}>
                        {isActive && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: p.color }}>
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3" style={{ background: p.gradient }}>
                          {p.icon}
                        </div>
                        <p className="text-sm font-bold text-gray-900">{p.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Config row */}
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom du lot</label>
                    <input type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} required
                      placeholder="Ex: Lot Voyageurs Janvier 2026"
                      className="w-full min-h-[48px] px-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none transition"
                      style={batchName ? { borderColor: pack.color } : {}} />
                  </div>
                  <div className="w-36">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantité</label>
                    <div className="flex items-center gap-2">
                      {[4, 8, 16, 32].map((q) => (
                        <button key={q} type="button" onClick={() => setQuantity(q)}
                          className={`flex-1 min-h-[48px] rounded-xl text-xs font-bold transition ${
                            quantity === q ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          style={quantity === q ? { backgroundColor: pack.color } : {}}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={creating || !batchName.trim()}
                    className="px-8 min-h-[48px] rounded-xl font-bold text-white transition flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: pack.gradient }}>
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Générer {quantity} QR</>}
                  </button>
                </div>

                <AnimatePresence>
                  {error && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</motion.div>}
                </AnimatePresence>
              </form>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Result header */
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: pack.gradient }}>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{batchName}</p>
                    <p className="text-xs text-gray-400">{tags.length} QR codes {pack.title} générés</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {batchId && (
                    <>
                      <a href={`/api/batches/${batchId}/pdf`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 transition">
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </a>
                      <a href={`/api/batches/${batchId}/csv`} download
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 transition">
                        <Download className="w-3.5 h-3.5" /> CSV
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* QR Grid */}
              <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tags.map((tag, i) => (
                  <motion.div
                    key={tag.reference}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    style={{} }>
                    {/* Color top bar */}
                    <div className="h-1.5 w-full" style={{ background: pack.gradient }} />

                    {/* QR Code */}
                    <div className="p-4 flex items-center justify-center">
                      <div className="relative">
                        <img
                          src={`/api/qr/${tag.reference}?size=200`}
                          alt={`QR ${tag.reference}`}
                          className="w-32 h-32 rounded-xl"
                          loading="lazy"
                        />
                        {/* Pack badge overlay */}
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-md"
                          style={{ background: pack.gradient }}>
                          <span className="text-[8px] font-black">{pack.title.slice(0, 2).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reference + actions */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono font-bold text-gray-700">{tag.reference}</p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleCopy(tag.reference)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700" title="Copier">
                            {copiedRef === tag.reference ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <a href={`/api/qr/${tag.reference}?size=400`} download={`qrioo-${tag.reference}.png`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700" title="Télécharger">
                            <Download className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700">
                        En stock
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
