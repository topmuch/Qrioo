'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, QrCode, Package, Heart, Calendar, Building2,
  X, Clock, MapPin, User, Copy, Download,
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

const STATUS_LABELS: Record<string, string> = {
  in_stock: 'En stock',
  activated: 'Activé',
  scanned: 'Scanné',
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

interface ScanLogItem {
  id: string;
  location: string | null;
  message: string | null;
  finderName: string | null;
  finderPhone: string | null;
  createdAt: string;
  context: string | null;
}

interface QRDetail {
  id: string;
  reference: string;
  status: string;
  packType: string;
  scanCount: number;
  createdAt: string;
  lastScanDate: string | null;
  lastScanLocation: string | null;
  expiresAt: string | null;
  contentType: string | null;
  contentUrl: string | null;
  contentMetadata: string | null;
  batchName: string | null;
  scanLogs: ScanLogItem[];
}

/* ─── Component ─────────────────────────────────────────────────── */

export default function QRCodesView() {
  const { token } = useAuthStore();

  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [packFilter, setPackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  /* ── Detail panel state ──────────────────────────────────── */
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [detail, setDetail] = useState<QRDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  /* ── Fetch detail for a QR code ───────────────────────────── */
  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/qrcodes/${id}`);
      const data = await res.json();
      if (data.baggage) {
        const b = data.baggage;
        setDetail({
          id: b.id,
          reference: b.reference,
          status: b.status,
          packType: b.packType,
          scanCount: b.scanCount,
          createdAt: b.createdAt,
          lastScanDate: b.lastScanDate,
          lastScanLocation: b.lastScanLocation,
          expiresAt: b.expiresAt,
          contentType: b.contentType,
          contentUrl: b.contentUrl,
          contentMetadata: b.contentMetadata,
          batchName: b.batch?.name ?? null,
          scanLogs: (b.scanLogs ?? []).map((s: Record<string, unknown>) => ({
            id: s.id,
            location: s.location ?? null,
            message: s.message ?? null,
            finderName: s.finderName ?? null,
            finderPhone: s.finderPhone ?? null,
            createdAt: s.createdAt,
            context: s.context ?? null,
          })),
        });
      }
    } catch {
      /* ignore */
    }
    setDetailLoading(false);
  }, []);

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

  const formatDateTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleCardClick = (id: string) => {
    setSelectedQR(id);
    setDetail(null);
    fetchDetail(id);
  };

  const closePanel = () => {
    setSelectedQR(null);
    setDetail(null);
  };

  const copyReference = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.reference);
    } catch {
      /* ignore */
    }
  };

  const downloadQR = () => {
    if (!detail) return;
    const link = document.createElement('a');
    link.href = `/api/qr/${detail.reference}?size=400`;
    link.download = `qrioo-${detail.reference}.png`;
    link.click();
  };

  const parseContentMetadata = (raw: string | null): Record<string, unknown> | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  /* ─── Stat pill counts from current dataset ─────────────────── */

  const statInStock = qrcodes.filter((qr) => qr.status === 'in_stock').length;
  const statActivated = qrcodes.filter((qr) => qr.status === 'activated').length;
  const statScanned = qrcodes.filter((qr) => qr.scanCount > 0).length;

  return (
    <div className="flex-1 p-6 overflow-y-auto relative">
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
                  onClick={() => handleCardClick(qr.id)}
                  className={`bg-white rounded-2xl border p-4 flex flex-col items-center cursor-pointer relative transition-colors ${
                    selectedQR === qr.id ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-200'
                  }`}
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

      {/* ════════════════════════════════════════════════════════════
          Detail Panel — Slide from right
      ════════════════════════════════════════════════════════════ */}

      <AnimatePresence>
        {selectedQR && (
          <>
            {/* ── Overlay ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={closePanel}
            />

            {/* ── Panel ────────────────────────────────────────── */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Détails du QR Code</h2>
                <button
                  onClick={closePanel}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Panel body — scrollable */}
              <div className="flex-1 overflow-y-auto">
                {detailLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-400 mt-3">Chargement...</p>
                  </div>
                ) : detail ? (
                  <div className="p-4 space-y-5">
                    {/* ── QR Code image ─────────────────────────── */}
                    <div className="flex justify-center">
                      <img
                        src={`/api/qr/${detail.reference}?size=200`}
                        alt={detail.reference}
                        className="w-40 h-40 rounded-xl border border-gray-100 shadow-sm"
                      />
                    </div>

                    {/* ── Reference ─────────────────────────────── */}
                    <div className="text-center">
                      <p className="font-mono text-sm font-bold text-gray-900">
                        {detail.reference}
                      </p>
                    </div>

                    {/* ── Status + Pack badges ──────────────────── */}
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: getStatusColor(detail.status) + '18',
                          color: getStatusColor(detail.status),
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusColor(detail.status) }} />
                        {STATUS_LABELS[detail.status] ?? detail.status}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: getPackColor(detail.packType) + '18',
                          color: getPackColor(detail.packType),
                        }}
                      >
                        {getPackInfo(detail.packType).icon}
                        {getPackInfo(detail.packType).title}
                      </span>
                    </div>

                    {/* ── Info grid ─────────────────────────────── */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                      {/* Batch */}
                      {detail.batchName && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Lot</span>
                          <span className="font-semibold text-gray-700">{detail.batchName}</span>
                        </div>
                      )}

                      {/* Created */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-3 h-3" />
                          Créé le
                        </span>
                        <span className="font-semibold text-gray-700">
                          {formatDateTime(detail.createdAt)}
                        </span>
                      </div>

                      {/* Scan count */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Eye className="w-3 h-3" />
                          Scans
                        </span>
                        <span className="font-semibold text-gray-700">{detail.scanCount}</span>
                      </div>

                      {/* Last scan date */}
                      {detail.lastScanDate && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3" />
                            Dernier scan
                          </span>
                          <span className="font-semibold text-gray-700">
                            {formatDateTime(detail.lastScanDate)}
                          </span>
                        </div>
                      )}

                      {/* Last scan location */}
                      {detail.lastScanLocation && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-gray-400">
                            <MapPin className="w-3 h-3" />
                            Lieu
                          </span>
                          <span className="font-semibold text-gray-700 text-right max-w-[180px] truncate">
                            {detail.lastScanLocation}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Content metadata (if activated) ───────── */}
                    {detail.status === 'activated' && (
                      <div className="bg-purple-50/60 rounded-xl p-3 space-y-2">
                        <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                          Contenu associé
                        </p>
                        <ContentMetadataSummary metadata={detail.contentMetadata} />
                      </div>
                    )}

                    {/* ── Action buttons ────────────────────────── */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyReference}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copier
                      </button>
                      <button
                        onClick={downloadQR}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Télécharger
                      </button>
                    </div>

                    {/* ── Scan history timeline ─────────────────── */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Historique des scans
                        {detail.scanLogs.length > 0 && (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {detail.scanLogs.length}
                          </span>
                        )}
                      </h3>

                      {detail.scanLogs.length === 0 ? (
                        <div className="text-center py-8 text-gray-300">
                          <Eye className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-xs">Aucun scan enregistré</p>
                        </div>
                      ) : (
                        <div className="relative pl-5 space-y-0">
                          {/* Vertical timeline line */}
                          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

                          {detail.scanLogs.map((scan) => (
                            <div key={scan.id} className="relative pb-4 last:pb-0">
                              {/* Timeline dot */}
                              <div className="absolute left-[-14px] top-1.5 w-[15px] h-[15px] rounded-full bg-white border-2 border-purple-400 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              </div>

                              {/* Content */}
                              <div className="bg-gray-50 rounded-lg p-2.5">
                                <p className="text-[11px] font-semibold text-gray-800">
                                  {formatDateTime(scan.createdAt)}
                                </p>

                                <div className="mt-1.5 space-y-1">
                                  {scan.finderName && (
                                    <p className="flex items-center gap-1 text-[11px] text-gray-600">
                                      <User className="w-3 h-3 text-gray-400" />
                                      {scan.finderName}
                                    </p>
                                  )}
                                  {scan.location && (
                                    <p className="flex items-center gap-1 text-[11px] text-gray-600">
                                      <MapPin className="w-3 h-3 text-gray-400" />
                                      {scan.location}
                                    </p>
                                  )}
                                  {scan.message && (
                                    <p className="text-[11px] text-gray-500 italic mt-1 pl-4 border-l-2 border-purple-200">
                                      &ldquo;{scan.message}&rdquo;
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Content Metadata Summary Sub-component ────────────────────── */

function ContentMetadataSummary({ metadata }: { metadata: string | null }) {
  const parsed = (() => {
    if (!metadata) return null;
    try {
      return JSON.parse(metadata) as Record<string, unknown>;
    } catch {
      return null;
    }
  })();

  if (!parsed) {
    return <p className="text-[11px] text-gray-500">Aucune métadonnée disponible</p>;
  }

  const entries = Object.entries(parsed).filter(
    ([key]) => !['id', 'createdAt', 'updatedAt'].includes(key),
  );

  if (entries.length === 0) {
    return <p className="text-[11px] text-gray-500">Aucune métadonnée disponible</p>;
  }

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-start justify-between gap-2 text-[11px]">
          <span className="text-purple-400 font-medium capitalize shrink-0">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <span className="text-gray-700 text-right font-semibold truncate">
            {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}