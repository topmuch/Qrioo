'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Zap, Loader2, Package, Heart, Calendar, Building2,
} from 'lucide-react';

const PACKS = [
  { id: 'pratique', title: 'Pack Pratique', subtitle: 'Objets perdus', color: '#E3B23C', gradient: 'from-amber-400 to-amber-600', icon: <Package className="w-7 h-7" /> },
  { id: 'emotion', title: 'Pack Émotion', subtitle: 'Messages spéciaux', color: '#7C3AED', gradient: 'from-purple-500 to-pink-500', icon: <Heart className="w-7 h-7" /> },
  { id: 'evenementiel', title: 'Pack Événementiel', subtitle: "Livre d'or", color: '#059669', gradient: 'from-pink-500 to-rose-500', icon: <Calendar className="w-7 h-7" /> },
  { id: 'immobilier', title: 'Pack Immobilier', subtitle: 'Fiches biens', color: '#D97706', gradient: 'from-amber-500 to-orange-500', icon: <Building2 className="w-7 h-7" /> },
];

export default function ScanPageView() {
  const [scanRef, setScanRef] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
  const [scanError, setScanError] = useState('');

  const handleScan = useCallback(async () => {
    if (!scanRef.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setScanError('');
    try {
      const res = await fetch(`/api/scan/${scanRef.trim()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.error) { setScanError(data.error); }
      else { setScanResult(data); }
    } catch { setScanError('Erreur de connexion'); }
    setIsScanning(false);
  }, [scanRef]);

  const packType = (scanResult?.packType as string) || '';
  const packInfo = PACKS.find((p) => p.id === packType);
  const baggage = scanResult?.baggage as Record<string, unknown> | undefined;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900">Page de Scan</h1>
          <p className="text-sm text-gray-500 mt-1">Simulation de ce que voit l'utilisateur final lors du scan d'un QR code</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={scanRef}
              onChange={(e) => setScanRef(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="Entrez une référence QR (ex: QROO-25-000001)"
              className="flex-1 min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-sm font-mono"
            />
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning || !scanRef.trim()}
              className="px-6 py-3 rounded-xl font-bold text-white transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[48px]"
              style={{ backgroundColor: '#7C3AED' }}
            >
              {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-4 h-4" /> Scanner</>}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">
            L'API route dynamiquement vers le bon handler selon le <code className="bg-gray-100 px-1 rounded font-mono">pack_type</code> du QR code.
          </p>
        </div>

        {scanError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">{scanError}</motion.div>
        )}

        {scanResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {packInfo && (
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${packInfo.gradient} flex items-center justify-center text-white`}>{packInfo.icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{packInfo.title}</p>
                  <p className="text-xs text-gray-500">{packInfo.subtitle}</p>
                </div>
              </div>
            )}

            {packType === 'pratique' && baggage ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <QrCode className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-gray-900">{(baggage.travelerName as string) || 'N/A'}</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm font-bold text-amber-800 mb-1">Objet recherché</p>
                    <p className="text-sm text-amber-700">{(baggage.objectInfo as Record<string, string>)?.object_name || 'Non renseigné'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Statut</p>
                      <p className="text-sm font-bold text-gray-800">{baggage.status === 'activated' ? '✅ Actif' : '📦 En stock'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Agence</p>
                      <p className="text-sm font-bold text-gray-800">{(baggage.agency as string) || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">En production, un formulaire de contact + redirection WhatsApp s'affiche ici.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  {packInfo?.icon}
                  <h3 className="text-lg font-bold text-gray-900">{packInfo?.title || 'Résultat du scan'}</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap max-h-60 overflow-auto">{JSON.stringify(scanResult, null, 2)}</pre>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">En production, l'interface adaptée au pack s'affiche ici.</p>
              </div>
            )}
          </motion.div>
        )}

        {!scanResult && !scanError && (
          <div className="grid sm:grid-cols-2 gap-4">
            {PACKS.map((pack) => (
              <div key={pack.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${pack.gradient} flex items-center justify-center text-white text-sm`}>{pack.icon}</div>
                  <span className="text-sm font-bold text-gray-800">{pack.title}</span>
                </div>
                <p className="text-xs text-gray-500">Les QR codes de ce pack affichent une interface {pack.subtitle.toLowerCase()} optimisée mobile.</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
