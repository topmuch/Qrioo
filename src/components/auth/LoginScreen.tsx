'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Mail, Lock, Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore, type AuthUser } from '@/store/auth';

const QRIOO_PURPLE = '#7C3AED';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  agency?: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'superadmin@qrioo.com', password: 'admin123', role: 'SUPERADMIN' },
  { email: 'admin@voyages-serenite.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Voyages Sérénité' },
  { email: 'admin@azur-immo.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Azur Immo' },
];

export default function LoginScreen() {
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

  const handleDemoLogin = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #6d28d9 100%)' }}>
      {/* Animated grid bg */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Left panel: branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: QRIOO_PURPLE }}>
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Qrioo</h1>
              <p className="text-sm text-white/50">QR Codes Dynamiques Multi-Usages</p>
            </div>
          </div>
          <p className="text-xl text-white/80 leading-relaxed mb-12 max-w-md">
            La plateforme SaaS tout-en-un pour gérer vos QR codes dynamiques. Objets perdus, émotions, événements et immobilier.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {['4 Packs', 'Scan &lt; 2s', 'Dashboard temps réel', 'Multi-agences'].map((label) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <p className="text-sm font-semibold text-white">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel: login form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: QRIOO_PURPLE }}>
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Qrioo</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">Connexion</h2>
              <p className="text-sm text-gray-500 mt-1">Accédez à votre espace Qrioo</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[48px] pl-11 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition text-sm"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
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

            {/* Demo accounts */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">Comptes de démonstration</p>
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
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      account.role === 'SUPERADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {account.role === 'SUPERADMIN' ? 'Superadmin' : 'Admin Agence'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-white/40 text-xs mt-6">
            Qrioo SaaS · Plateforme QR Codes Dynamiques
          </p>
        </motion.div>
      </div>
    </div>
  );
}
