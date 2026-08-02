'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, QrCode, Package, Heart, Calendar, Building2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

/* ─── Pack definitions ──────────────────────────────────────────── */

const PACKS = [
  { id: 'pratique', title: 'Pratique', color: '#F59E0B', icon: <Package className="w-3 h-3" /> },
  { id: 'emotion', title: 'Émotion', color: '#7C3AED', icon: <Heart className="w-3 h-3" /> },
  { id: 'evenementiel', title: 'Événementiel', color: '#059669', icon: <Calendar className="w-3 h-3" /> },
  { id: 'immobilier', title: 'Immobilier', color: '#64748B', icon: <Building2 className="w-3 h-3" /> },
] as const;

const PACK_MAP = Object.fromEntries(PACKS.map((p) => [p.id, p]));

/* ─── Status color map ──────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  in_stock: '#F59E0B',
  activated: '#10B981',
  scanned: '#3B82F6',
};

/* ─── Status filter options ────────────────────────────────────── */

const STATUS_FILTERS = [
  { id: '', label: 'Tous' },
  { id: 'in_stock', label: 'En stock' },
  { id: 'activated', label: 'Activés' },
  { id: 'scanned', label: 'Scannés' },
];

/* ─── Types ─────────────────────────────────────────────────────── */

interface QRCodeItem {
  id: string;
  reference: string;
  status: string;
  packType: string;
  scanCount: number;
  createdAt: string;
  lastScanDate: string | null;
  lastScanLocation: string | null;
  batchName: string | null;
  batchId: string | null;
}

/* ─── Component ─────────────────────────────────────────────────── */

export default function QRCodesView() {
  const { token } = useAuthStore();

  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [packFilter, setPackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchQRCodes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '50');
      if (statusFilter) params.set('status', statusFilter);
      if (packFilter) params.set('pack', packFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/qrcodes?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.qrcodes) {
        setQrcodes(data.qrcodes);
      }
    } catch {
      /* ignore network errors */
    }
    setLoading(false);
  }, [token, statusFilter, packFilter, searchQuery]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  /* ─── Helpers ─────────────────────────────────────────────── */

  const getPackColor = (packType: string): string => PACK_MAP[packType]?.color ?? '#9CA3AF';
  const getPackInfo = (packType: string) => PACK_MAP[packType] ?? PACK_MAP.pratique;
  const getStatusColor = (status: string): string => STATUS_COLORS[status] ?? '#9CA3AF';

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  /* ─── Stat pill counts from current dataset ─────────────────── */

  const statInStock = qrcodes.filter((qr) => qr.status === 'in_stock').length;
  const statActivated = qrcodes.filter((qr) => qr.status === 'activated').length;
  const statScanned = qrcodes.filter((qr) => qr.scanCount > 0).length;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Mes QR Codes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Traçabilité et suivi de vos QR codes
        </p>
      </div>

      {/* ── Stat pills ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-gray-700">{statInStock}</span>
          <span className="text-xs text-gray-400">En stock</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-gray-700">{statActivated}</span>
          <span className="text-xs text-gray-400">Activés</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-xs font-bold text-gray-700">{statScanned}</span>
          <span className="text-xs text-gray-400">Scannés</span>
        </div>
      </div>

      {/* ── Search input ─────────────────────────────────────── */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par référence..."
          className="w-full min-h-[42px] pl-10 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* ── Pack filter buttons ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => setPackFilter('')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            !packFilter ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        {PACKS.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setPackFilter(pack.id === packFilter ? '' : pack.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              packFilter === pack.id ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pack.color }} />
            {pack.title}
          </button>
        ))}
      </div>

      {/* ── Status filter buttons ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf.id || 'all-status'}
            onClick={() => setStatusFilter(sf.id === statusFilter ? '' : sf.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              statusFilter === sf.id ? 'bg-gray-900 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* ── QR Code Grid ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
              <div className="w-28 h-28 bg-gray-200 rounded-lg mx-auto mb-3" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : qrcodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
          <QrCode className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">Aucun QR code trouvé</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${packFilter}-${statusFilter}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {qrcodes.map((qr, index) => {
              const packInfo = getPackInfo(qr.packType);
              const statusColor = getStatusColor(qr.status);

              return (
                <motion.div
                  key={qr.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center cursor-pointer relative"
                >
                  {/* Top colored bar */}
                  <div
                    className="absolute top-0 left-3 right-3 h-[3px] rounded-b-full"
                    style={{ backgroundColor: getPackColor(qr.packType) }}
                  />

                  {/* QR image with status dot overlay */}
                  <div className="relative mt-2 mb-3">
                    <img
                      src={`/api/qr/${qr.reference}?size=150`}
                      alt={qr.reference}
                      className="w-28 h-28 rounded-lg bg-gray-50"
                      loading="lazy"
                    />
                    {/* Status dot indicator */}
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: statusColor }}
                    />
                  </div>

                  {/* Reference */}
                  <p className="font-mono text-xs font-bold text-gray-800 mb-1.5">
                    {qr.reference}
                  </p>

                  {/* Pack type badge */}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mb-2"
                    style={{
                      backgroundColor: getPackColor(qr.packType) + '18',
                      color: getPackColor(qr.packType),
                    }}
                  >
                    {packInfo.icon}
                    {packInfo.title}
                  </span>

                  {/* Bottom section: scan count + last scan */}
                  <div className="mt-auto w-full border-t border-gray-100 pt-2 flex items-center justify-between gap-1">
                    {qr.scanCount > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Eye className="w-3 h-3" />
                        {qr.scanCount} scan{qr.scanCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-300">—</span>
                    )}
                    {qr.lastScanDate && (
                      <span className="text-[10px] text-gray-400">
                        {formatDate(qr.lastScanDate)}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
