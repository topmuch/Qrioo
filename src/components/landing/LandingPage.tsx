'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Shield, Zap, BarChart3, Building2, ScanLine,
  Heart, PartyPopper, Home, ArrowRight, X, ChevronRight,
  Mail, Lock, Loader2, Eye, EyeOff, LogIn
} from 'lucide-react';
import { useAuthStore, type AuthUser } from '@/store/auth';

const QRIOO_PURPLE = '#7C3AED';

const PACKS = [
  {
    name: 'Pratique',
    icon: <ScanLine className="w-7 h-7" />,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    desc: 'Bagages, objets perdus, étiquettes voyage. Retrouvez vos affaires en un scan.',
  },
  {
    name: 'Émotion',
    icon: <Heart className="w-7 h-7" />,
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    desc: 'Messages, souvenirs, témoignages. Créez des connexions émotionnelles uniques.',
  },
  {
    name: 'Événementiel',
    icon: <PartyPopper className="w-7 h-7" />,
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    desc: 'Weddings, concerts, conférences. Digitalisez vos événements avec des QR codes.',
  },
  {
    name: 'Immobilier',
    icon: <Home className="w-7 h-7" />,
    color: '#64748B',
    bg: '#F8FAFC',
    border: '#CBD5E1',
    desc: 'Visites virtuelles, fiches biens, contacts agents. Modernisez vos annonces immobilières.',
  },
];

const FEATURES = [
  { icon: <Zap className="w-6 h-6" />, title: 'Scan instantané', desc: 'QR codes activés en moins de 2 secondes' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Dashboard temps réel', desc: 'Statistiques et activité en direct' },
  { icon: <Building2 className="w-6 h-6" />, title: 'Multi-agences', desc: 'Gérez plusieurs agences depuis un seul compte' },
  { icon: <Shield className="w-6 h-6" />, title: 'Sécurisé', desc: 'Authentification et rôles avancés' },
  { icon: <QrCode className="w-6 h-6" />, title: '4 Packs spécialisés', desc: 'Pratique, Émotion, Événementiel, Immobilier' },
  { icon: <ScanLine className="w-6 h-6" />, title: 'Génération en masse', desc: 'Créez des lots de QR codes en PDF ou CSV' },
];

const DEMO_ACCOUNTS = [
  { email: 'superadmin@qrioo.com', password: 'admin123', role: 'SUPERADMIN' },
  { email: 'admin@voyages-serenite.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Voyages Sérénité' },
  { email: 'admin@azur-immo.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Azur Immo' },
];

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.token, data.user as AuthUser);
      } else {
        setError(data.error || 'Erreur de connexion');
      }
    } catch {
      setError('Erreur réseau');
    }
    setLoading(false);
  };

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: QRIOO_PURPLE }}>
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">Qrioo</span>
          </div>
          <button
            onClick={() => setShowLogin(true)}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition hover:scale-[1.03] active:scale-[0.98] shadow-md"
            style={{ backgroundColor: QRIOO_PURPLE }}
          >
            Connexion
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #7C3AED 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-6"
              style={{ borderColor: '#DDD6FE', color: QRIOO_PURPLE, backgroundColor: '#F5F3FF' }}>
              <Zap className="w-3.5 h-3.5" />
              Plateforme SaaS QR Codes Dynamiques
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto">
              Vos QR codes,{' '}
              <span style={{ color: QRIOO_PURPLE }}>uniques et dynamiques</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Créez, gérez et suivez vos QR codes sur une seule plateforme.
              Objets perdus, émotions, événements et immobilier.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-base transition hover:scale-[1.03] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: QRIOO_PURPLE }}
              >
                Commencer maintenant <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('packs')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-gray-700 text-base border-2 border-gray-200 hover:border-purple-300 hover:text-purple-700 transition flex items-center justify-center gap-2"
              >
                Découvrir les packs <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto"
          >
            {[
              { value: '4', label: 'Packs' },
              { value: '<2s', label: 'Temps de scan' },
              { value: '∞', label: 'QR codes' },
              { value: '24/7', label: 'Disponible' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black" style={{ color: QRIOO_PURPLE }}>{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packs */}
      <section id="packs" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">4 Packs spécialisés</h2>
            <p className="mt-3 text-gray-500 text-lg">Un QR code pour chaque besoin</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKS.map((pack, i) => (
              <motion.div
                key={pack.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl p-6 border-2 hover:shadow-lg transition group"
                style={{ backgroundColor: pack.bg, borderColor: pack.border }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white" style={{ backgroundColor: pack.color }}>
                  {pack.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{pack.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{pack.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Tout ce qu'il vous faut</h2>
            <p className="mt-3 text-gray-500 text-lg">Une plateforme complète pour vos QR codes</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-md hover:border-purple-100 transition"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: QRIOO_PURPLE }}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #6d28d9 100%)' }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Prêt à commencer ?</h2>
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                Créez votre premier QR code dynamique en quelques secondes.
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-3.5 rounded-xl font-bold text-white text-base bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 transition hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2"
              >
                Accéder à Qrioo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: QRIOO_PURPLE }}>
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Qrioo</span>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Qrioo. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLogin(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: QRIOO_PURPLE }}>
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Connexion</h2>
                    <p className="text-xs text-gray-400">Accédez à votre espace Qrioo</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full min-h-[48px] pl-11 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-[48px] pl-11 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full min-h-[48px] rounded-xl font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                    style={{ backgroundColor: QRIOO_PURPLE }}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> Se connecter</>}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">Comptes démo</p>
                  <div className="space-y-2">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => handleDemoLogin(account)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition text-left group"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                          account.role === 'SUPERADMIN' ? 'bg-purple-600' : 'bg-amber-500'
                        }`}>
                          {account.role === 'SUPERADMIN' ? 'SA' : 'AA'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{account.agency || 'Super Admin'}</p>
                          <p className="text-[11px] text-gray-400 truncate">{account.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
