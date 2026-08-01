'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore, type AppView } from '@/store/auth';
import LandingPage from '@/components/landing/LandingPage';
import AppSidebar from '@/components/layout/AppSidebar';
import DashboardView from '@/components/dashboard/DashboardView';
import AgencesView from '@/components/dashboard/AgencesView';
import LotsView from '@/components/dashboard/LotsView';
import TagsView from '@/components/dashboard/TagsView';
import ScanPageView from '@/components/dashboard/ScanPageView';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading, setLoading, setUser, setToken, token, user, currentView } = useAuthStore();

  // On mount, try to restore session
  useEffect(() => {
    const savedToken = localStorage.getItem('qrioo_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);

    // Verify token with server
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${savedToken}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) {
          setUser(d.user);
          setToken(savedToken);
        } else {
          setToken(null);
        }
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Loading state
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

  // Not authenticated → Landing page with login modal
  if (!isAuthenticated || !user) {
    return <LandingPage />;
  }

  // Authenticated → App layout
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'agences': return <AgencesView />;
      case 'lots': return <LotsView />;
      case 'tags': return <TagsView />;
      case 'scan': return <ScanPageView />;
      case 'settings': return <DashboardView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
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
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
              user.role === 'SUPERADMIN'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {user.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN AGENCE'}
            </span>
          </div>
        </header>

        {/* Main content */}
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
