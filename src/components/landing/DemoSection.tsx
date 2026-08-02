'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  QrCode, ArrowRight, RefreshCw, Clock, Shield, ScanLine,
  BarChart3, Zap, Users, Check, Loader2, ExternalLink, Play,
} from 'lucide-react';

const QRIOO = {
  purple: '#7C3AED',
  amber: '#F59E0B',
  emerald: '#10B981',
  slate: '#64748B',
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface DemoData {
  totalQR: number;
  activatedQR: number;
  totalScans: number;
  totalBatches: number;
  minutesUntilNextReset: number;
  lastReset: string | null;
}

const DEMO_ACCOUNTS = [
  { email: 'superadmin@qrioo.com', password: 'admin123', label: 'Super Admin', role: 'SUPERADMIN' },
  { email: 'admin@voyages-serenite.com', password: 'agence123', label: 'Voyages Sérénité', role: 'ADMIN_AGENCE' },
  { email: 'admin@azur-immo.com', password: 'agence123', label: 'Azur Immo', role: 'ADMIN_AGENCE' },
];

const PACK_TYPES = [
  { name: 'Pratique', color: QRIOO.amber, count: 14, icon: ScanLine },
  { name: 'Émotion', color: QRIOO.purple, count: 6, icon: Users },
  { name: 'Événementiel', color: QRIOO.emerald, count: 8, icon: Zap },
  { name: 'Immobilier', color: QRIOO.slate, count: 10, icon: BarChart3 },
];

const MOCK_ACTIVITY = [
  { time: '14:32', action: 'QR scanné', ref: 'QROO-25-8A3F1B', type: 'scan', color: QRIOO.emerald },
  { time: '14:28', action: 'Lot créé', ref: 'Demo Bagages', type: 'create', color: QRIOO.purple },
  { time: '14:15', action: 'QR activé', ref: 'QROO-25-7C2D9E', type: 'activate', color: QRIOO.amber },
  { time: '13:58', action: 'QR scanné', ref: 'QROO-25-4E8A2F', type: 'scan', color: QRIOO.emerald },
  { time: '13:42', action: 'Connexion', ref: 'Marie Dupont', type: 'login', color: QRIOO.slate },
];

export default function DemoSection({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [activeDemoAccount, setActiveDemoAccount] = useState(DEMO_ACCOUNTS[0]);
  const [showAccounts, setShowAccounts] = useState(false);

  const fetchDemoStatus = useCallback(() => {
    fetch('/api/demo/reset')
      .then((r) => r.json())
      .then((d) => {
        if (d.mode === 'demo') {
          setDemoData({
            totalQR: d.currentData?.totalQR ?? 38,
            activatedQR: d.currentData?.activatedQR ?? 8,
            totalScans: d.currentData?.totalScans ?? 12,
            totalBatches: d.currentData?.totalBatches ?? 6,
            minutesUntilNextReset: d.minutesUntilNextReset ?? 60,
            lastReset: d.lastReset ?? null,
          });
        }
      })
      .catch(() => {
        // Fallback mock data
        setDemoData({
          totalQR: 38, activatedQR: 8, totalScans: 12, totalBatches: 6,
          minutesUntilNextReset: 45, lastReset: null,
        });
      });
  }, []);

  useEffect(() => {
    fetchDemoStatus();
    const interval = setInterval(fetchDemoStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchDemoStatus]);

  // Countdown timer
  useEffect(() => {
    if (!demoData) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const [m, s] = prev ? prev.split(':').map(Number) : [demoData.minutesUntilNextReset, 0];
        let newSec = (s || 0) - 1;
        let newMin = m;
        if (newSec < 0) { newSec = 59; newMin--; }
        if (newMin < 0) { fetchDemoStatus(); return `${demoData.minutesUntilNextReset}:00`; }
        return `${newMin}:${String(newSec).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [demoData, fetchDemoStatus]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      fetchDemoStatus();
    } catch {}
    setIsResetting(false);
  };

  const handleDemoLogin = () => {
    onLogin(activeDemoAccount.email, activeDemoAccount.password);
  };

  return (
    <section ref={ref} id="demo" className="py-24 sm:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: QRIOO.emerald, backgroundColor: '#ECFDF5' }}
          >
            <Play className="w-3 h-3" /> Démo en direct
          </motion.div>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900"
          >
            Essayez Qrioo{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">maintenant</span>
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Une démo live avec de vraies données. Connectez-vous instantanément et explorez toutes les fonctionnalités.
          </motion.p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="grid lg:grid-cols-5 gap-6">
          {/* ── Left: Live Stats ── */}
          <div className="lg:col-span-3 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 relative overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #34D399, #10B981)' }}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Données en direct</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-gray-400">Démo active</span>
                  </div>
                </div>
              </div>

              {/* Countdown + Reset */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-mono font-bold text-gray-600">{countdown || '--:--'}</span>
                </div>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Réinitialiser la démo"
                >
                  {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'QR Codes', value: demoData?.totalQR ?? '...', color: QRIOO.purple, icon: QrCode },
                { label: 'Activés', value: demoData?.activatedQR ?? '...', color: QRIOO.amber, icon: Zap },
                { label: 'Scans', value: demoData?.totalScans ?? '...', color: QRIOO.emerald, icon: ScanLine },
                { label: 'Lots', value: demoData?.totalBatches ?? '...', color: QRIOO.slate, icon: Shield },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} variants={fadeUp} transition={{ duration: 0.4 }}
                    className="rounded-2xl p-4 border border-gray-100 bg-gray-50/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Pack breakdown */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Répartition par pack</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PACK_TYPES.map((pack) => {
                  const Icon = pack.icon;
                  return (
                    <motion.div key={pack.name} variants={fadeUp} transition={{ duration: 0.4 }}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${pack.color}15`, color: pack.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{pack.count}</p>
                        <p className="text-[10px] text-gray-400">{pack.name}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Activité récente</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {MOCK_ACTIVITY.map((item, i) => (
                  <motion.div key={i} variants={fadeUp} transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-400 font-mono flex-shrink-0 w-10">{item.time}</span>
                    <span className="text-sm text-gray-600 flex-1">{item.action}</span>
                    <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{item.ref}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Login Panel ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Demo login card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Accès démo</p>
                  <p className="text-xs text-gray-400">Connexion instantanée</p>
                </div>
              </div>

              {/* Account selector */}
              <div className="space-y-2 mb-6">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => setActiveDemoAccount(account)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      activeDemoAccount.email === account.email
                        ? 'border-purple-400 bg-purple-50/50'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white ${
                      account.role === 'SUPERADMIN' ? 'bg-purple-600' : 'bg-amber-500'
                    }`}>
                      {account.role === 'SUPERADMIN' ? 'SA' : 'AA'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{account.label}</p>
                      <p className="text-[11px] text-gray-400 truncate">{account.email}</p>
                    </div>
                    {activeDemoAccount.email === account.email && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Demo login button */}
              <button
                onClick={handleDemoLogin}
                className="w-full group min-h-[52px] rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2.5 transition-all duration-300 hover:shadow-xl hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6D28D9 100%)' }}
              >
                Lancer la démo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-3">
                Aucune inscription requise • Données réinitialisées chaque heure
              </p>
            </div>

            {/* Info cards */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ce que vous pouvez tester</p>
              <div className="space-y-3">
                {[
                  { icon: BarChart3, text: 'Tableau de bord avec KPIs', color: QRIOO.purple },
                  { icon: QrCode, text: 'Studio de création de QR codes', color: QRIOO.amber },
                  { icon: ScanLine, text: 'Grille visuelle avec statuts', color: QRIOO.emerald },
                  { icon: ExternalLink, text: 'Export PDF et CSV', color: QRIOO.slate },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color}12`, color: item.color }}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-600">{item.text}</span>
                      <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset info */}
            <div className="rounded-2xl p-4 bg-gray-900 text-white">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-bold text-gray-300">Auto-réinitialisation</p>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Les données de la démo sont réinitialisées automatiquement toutes les heures pour offrir une expérience fraîche à chaque visiteur.
              </p>
              {demoData?.lastReset && (
                <p className="text-[10px] text-gray-500 mt-2">
                  Dernière réinitialisation : {new Date(demoData.lastReset).toLocaleTimeString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
