'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Layers, Eye, TrendingUp, RefreshCw, Building2, Users, Package,
  Heart, Calendar, PieChart, Activity, Clock, ChevronDown, FileText, Download,
  AlertCircle, Loader2, Plus,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import QRGenerator from './QRGenerator';

const PACKS = [
  { id: 'pratique', title: 'Pratique', subtitle: 'Objets perdus', color: '#E3B23C', icon: <Package className="w-4 h-4" /> },
  { id: 'emotion', title: 'Émotion', subtitle: 'Messages', color: '#7C3AED', icon: <Heart className="w-4 h-4" /> },
  { id: 'evenementiel', title: 'Événementiel', subtitle: "Livre d'or", color: '#059669', icon: <Calendar className="w-4 h-4" /> },
  { id: 'immobilier', title: 'Immobilier', subtitle: 'Fiches biens', color: '#475569', icon: <Building2 className="w-4 h-4" /> },
];

const PACK_COLORS = ['#E3B23C', '#7C3AED', '#059669', '#475569'];

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

interface DashboardData {
  totalTags: number;
  totalActivated: number;
  totalBatches: number;
  totalScans: number;
  totalBatchTags: number;
  activationRate: number;
  totalAgencies: number;
  totalUsers: number;
  packBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  dailyActivity: Array<{ date: string; created: number; scanned: number }>;
  recentBatches: Array<Record<string, unknown>>;
  recentScans: Array<Record<string, unknown>>;
  agencies: Array<Record<string, unknown>> | null;
}

export default function DashboardView() {
  const { token, user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const [dash, setDash] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [packFilter, setPackFilter] = useState('all');
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchTags, setBatchTags] = useState<Array<{ reference: string; status: string }>>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchDash = useCallback(async (pk?: string) => {
    const q = pk && pk !== 'all' ? `?pack=${pk}` : '';
    const res = await fetch(`/api/dashboard${q}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const d = await res.json();
    if (!d.error) setDash(d);
    return d;
  }, [token]);

  useEffect(() => {
    fetchDash(packFilter).finally(() => setLoading(false));
  }, [fetchDash, packFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDash(packFilter);
    setRefreshing(false);
  };

  const handleExpandBatch = async (batchId: string) => {
    if (expandedBatch === batchId) { setExpandedBatch(null); setBatchTags([]); return; }
    setExpandedBatch(batchId);
    setBatchLoading(true);
    try {
      const r = await fetch(`/api/batches/${batchId}/tags`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (r.ok) { const d = await r.json(); setBatchTags(d.tags || []); }
    } catch { /* ignore */ }
    setBatchLoading(false);
  };

  const kpiCards = [
    { label: 'Total QR Codes', value: dash?.totalTags || 0, sub: `${dash?.totalActivated || 0} activés`, icon: <QrCode className="w-5 h-5 text-white" />, gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)' },
    { label: "Taux d'activation", value: `${dash?.activationRate || 0}%`, sub: `${dash?.totalTags || 0} tags`, icon: <TrendingUp className="w-5 h-5 text-white" />, gradient: 'linear-gradient(135deg, #059669, #0D9488)' },
    { label: 'Total Scans', value: dash?.totalScans || 0, sub: 'Tous packs', icon: <Eye className="w-5 h-5 text-white" />, gradient: 'linear-gradient(135deg, #D97706, #EA580C)' },
  ];
  if (isSuperAdmin) {
    kpiCards.push(
      { label: 'Agences', value: dash?.totalAgencies || 0, sub: `${dash?.totalUsers || 0} utilisateurs`, icon: <Building2 className="w-5 h-5 text-white" />, gradient: 'linear-gradient(135deg, #2563EB, #7C3AED)' },
      { label: 'Lots générés', value: dash?.totalBatches || 0, sub: `${dash?.totalBatchTags || 0} tags en lots`, icon: <Layers className="w-5 h-5 text-white" />, gradient: 'linear-gradient(135deg, #475569, #1E293B)' },
    );
  } else {
    kpiCards.push({ label: 'Lots générés', value: dash?.totalBatches || 0, sub: `${dash?.totalBatchTags || 0} tags en lots`, icon: <Layers className="w-5 h-5 text-white" />, gradient: 'linear-gradient(135deg, #475569, #1E293B)' });
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (<div key={i} className="bg-gray-200 rounded-2xl h-28 animate-pulse" />))}
        </div>
      </div>
    );
  }

  if (!dash) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">Erreur de chargement</p></div>
      </div>
    );
  }

  const pb = dash.packBreakdown || {};
  const total = Object.values(pb).reduce((s, v) => s + v, 0) || 1;
  const activity = dash.dailyActivity || [];
  const maxVal = Math.max(...activity.map((d) => Math.max(d.created, d.scanned)), 1);
  const hasActivity = activity.some((d) => d.created > 0 || d.scanned > 0);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {isSuperAdmin ? 'Tableau de bord global' : `Dashboard ${user?.agency?.name || ''}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isSuperAdmin ? "Vue d'ensemble de toutes les agences" : 'Vos statistiques et activités'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[{ value: 'all', label: 'Tous' }, ...PACKS.map((p) => ({ value: p.id, label: p.title }))].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setPackFilter(f.value); setLoading(true); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${
                  packFilter === f.value ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {f.value !== 'all' && <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: PACKS.find((p) => p.id === f.value)?.color || '#999' }} />}
                {f.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all disabled:opacity-50 min-h-[40px]">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-4 mb-8 ${isSuperAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {kpiCards.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow"
            style={{ background: kpi.gradient }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{kpi.icon}</div>
            </div>
            <p className="text-3xl font-black">{kpi.value}</p>
            <p className="text-xs text-white/60 mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Donut: Pack Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-500" /> Répartition par Pack
          </h3>
          <div className="flex items-center gap-8">
            <div className="relative w-36 h-36 flex-shrink-0">
              <div className="w-full h-full rounded-full" style={{
                background: (() => {
                  let gradient = '';
                  let cumPct = 0;
                  const types = ['pratique', 'emotion', 'evenementiel', 'immobilier'];
                  types.forEach((t, idx) => {
                    const pct = ((pb[t] || 0) / total) * 100;
                    if (pct > 0) { gradient += `${PACK_COLORS[idx]} ${cumPct}% ${cumPct + pct}%`; cumPct += pct; if (idx < 3 && cumPct < 100) gradient += ', '; }
                  });
                  if (cumPct === 0) return '#E5E7EB';
                  return `conic-gradient(${gradient})`;
                })(),
              }} />
              <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-black text-gray-800">{dash.totalTags}</p>
                  <p className="text-[10px] text-gray-400">tags</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              {['pratique', 'emotion', 'evenementiel', 'immobilier'].map((t, i) => {
                const pct = Math.round(((pb[t] || 0) / total) * 100);
                const labels = ['Pratique', 'Émotion', 'Événementiel', 'Immobilier'];
                return (
                  <div key={t} className="group cursor-default">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PACK_COLORS[i] }} />
                        <span className="text-sm text-gray-700 font-medium">{labels[i]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{pb[t] || 0}</span>
                        <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: PACK_COLORS[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Bar chart: Daily Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-500" /> Activité (14 jours)
          </h3>
          <div className="relative">
            {hasActivity ? (
              <>
                <div className="h-44 flex items-end gap-[3px]">
                  {activity.map((d) => {
                    const hC = Math.max((d.created / maxVal) * 100, 0);
                    const hS = Math.max((d.scanned / maxVal) * 100, 0);
                    const label = d.date.slice(5);
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          <p className="font-bold">{label}</p>
                          <p className="text-amber-400">+{d.created} créés</p>
                          <p className="text-violet-400">+{d.scanned} scannés</p>
                        </div>
                        <div className="w-full flex flex-col items-center justify-end" style={{ height: '140px' }}>
                          {hS > 0 && <div className="w-full max-w-[18px] rounded-t-md bg-violet-400 transition-all duration-300 group-hover:bg-violet-500" style={{ height: `${hS}%` }} />}
                          {hC > 0 && <div className="w-full max-w-[18px] rounded-t-md bg-amber-400 transition-all duration-300 group-hover:bg-amber-500" style={{ height: `${hC}%` }} />}
                          {hC === 0 && hS === 0 && <div className="w-full max-w-[18px] rounded-t-md bg-gray-100" style={{ height: '2px' }} />}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-0.5">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /><span className="text-[10px] text-gray-500">Créés</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-400" /><span className="text-[10px] text-gray-500">Scannés</span></div>
                </div>
              </>
            ) : (
              <div className="h-44 flex items-center justify-center">
                <p className="text-sm text-gray-400">Aucune activité sur les 14 derniers jours</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* QR Generator */}
      <div className="mb-8">
        <QRGenerator />
      </div>

      {/* Bottom row: Batches + Scans */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-500" /> Lots récents
          </h3>
          {(!dash.recentBatches || dash.recentBatches.length === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun lot</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {dash.recentBatches.map((b) => {
                const packInfo = PACKS.find((p) => p.id === b.packType);
                const isExp = expandedBatch === (b.id as string);
                return (
                  <div key={b.id as string}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleExpandBatch(b.id as string)}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: (packInfo?.color || '#999') + '15', color: packInfo?.color || '#999' }}>{packInfo?.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{b.name as string}</p>
                        <p className="text-xs text-gray-400">{(b.tagCount as number)} tags · {packInfo?.subtitle}{isSuperAdmin && b.agencyName ? ` · ${(b.agencyName as string)}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <a href={`/api/batches/${b.id as string}/pdf`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700" title="PDF"><FileText className="w-3.5 h-3.5" /></a>
                        <a href={`/api/batches/${b.id as string}/csv`} download onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700" title="CSV"><Download className="w-3.5 h-3.5" /></a>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExp && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="ml-12 mr-2 mb-2 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
                            {batchLoading ? <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div> :
                              batchTags.length === 0 ? <p className="text-xs text-gray-400">Aucun tag</p> :
                                <div className="flex flex-wrap gap-1.5">
                                  {batchTags.map((tag) => (
                                    <span key={tag.reference} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold ${tag.status === 'activated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${tag.status === 'activated' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                      {tag.reference}
                                    </span>
                                  ))}
                                </div>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-500" /> Scans récents
          </h3>
          {(!dash.recentScans || dash.recentScans.length === 0) ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3"><Eye className="w-5 h-5 text-gray-300" /></div>
              <p className="text-sm text-gray-400">Aucun scan enregistré</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {dash.recentScans.map((s) => {
                const packInfo = PACKS.find((p) => p.id === s.packType);
                return (
                  <div key={s.id as string} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: (packInfo?.color || '#999') + '15', color: packInfo?.color || '#999' }}>{packInfo?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 font-mono">{s.reference as string}</p>
                      <p className="text-xs text-gray-400">{packInfo?.subtitle}{s.location ? ` · ${s.location}` : ''}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${s.tagStatus === 'activated' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {s.tagStatus === 'activated' ? 'Actif' : 'Stock'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{getTimeAgo(s.createdAt as string)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution Bar */}
      {dash.statusBreakdown && Object.keys(dash.statusBreakdown).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-500" /> Distribution des statuts
          </h3>
          {(() => {
            const sb = dash.statusBreakdown;
            const stTotal = Object.values(sb).reduce((a, b) => a + b, 0) || 1;
            const SC: Record<string, string> = { in_stock: '#D97706', activated: '#059669', lost: '#DC2626', distributed: '#7C3AED' };
            const SL: Record<string, string> = { in_stock: 'En stock', activated: 'Activé', lost: 'Perdu', distributed: 'Distribué' };
            return (
              <>
                <div className="flex h-4 rounded-full overflow-hidden mb-4">
                  {Object.entries(sb).map(([status, count]) => (
                    <div key={status} className="transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${(count / stTotal) * 100}%`, backgroundColor: SC[status] || '#9CA3AF' }}
                      title={`${SL[status] || status}: ${count}`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(sb).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: SC[status] || '#9CA3AF' }} />
                      <span className="text-xs text-gray-600">{SL[status] || status}</span>
                      <span className="text-xs font-bold text-gray-900">{count as number}</span>
                      <span className="text-xs text-gray-400">({Math.round(((count as number) / stTotal) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
