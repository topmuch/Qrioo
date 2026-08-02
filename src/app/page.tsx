'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import LandingPage from '@/components/landing/LandingPage';
import AppSidebar from '@/components/layout/AppSidebar';
import DashboardView from '@/components/dashboard/DashboardView';
import AgencesView from '@/components/dashboard/AgencesView';
import StudioView from '@/components/dashboard/StudioView';
import QRCodesView from '@/components/dashboard/QRCodesView';
import ScanPageView from '@/components/dashboard/ScanPageView';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading, setLoading, setUser, setToken, user, currentView } = useAuthStore();

  useEffect(() => {
    const savedToken = localStorage.getItem('qrioo_token');
    if (!savedToken) { setLoading(false); return; }
    setToken(savedToken);
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${savedToken}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.user) { setUser(d.user); setToken(savedToken); } else { setToken(null); } })
      .catch(() => { setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#7C3AED' }} />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return <LandingPage />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'studio': return <StudioView />;
      case 'qrcodes': return <QRCodesView />;
      case 'agences': return <AgencesView />;
      case 'scan': return <ScanPageView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${
              user.role === 'SUPERADMIN' ? 'bg-purple-600' : 'bg-amber-500'
            }`}>
              {user.role === 'SUPERADMIN' ? 'SA' : 'AA'}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
              <p className="text-[11px] text-gray-400">
                {user.role === 'SUPERADMIN' ? 'Super Admin' : user.agency?.name || 'Admin Agence'}
              </p>
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
            user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN AGENCE'}
          </span>
        </header>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex overflow-hidden"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
