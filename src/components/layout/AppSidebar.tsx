'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, LayoutDashboard, Building2, Wand2, ScanLine,
  LogOut, ChevronLeft, ChevronRight, Shield, Users, Grid3X3,
} from 'lucide-react';
import { useAuthStore, type AppView } from '@/store/auth';

const QRIOO_PURPLE = '#7C3AED';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
  superadminOnly?: boolean;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'studio', label: 'Studio', icon: <Wand2 className="w-5 h-5" />, badge: 'Nouveau' },
  { id: 'qrcodes', label: 'Mes QR Codes', icon: <Grid3X3 className="w-5 h-5" /> },
  { id: 'agences', label: 'Agences', icon: <Building2 className="w-5 h-5" />, superadminOnly: true },
  { id: 'scan', label: 'Page Scan', icon: <ScanLine className="w-5 h-5" /> },
];

export default function AppSidebar() {
  const { user, currentView, setView, logout, sidebarOpen, toggleSidebar } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const filteredItems = NAV_ITEMS.filter((item) => !item.superadminOnly || isSuperAdmin);

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-gray-900 flex flex-col flex-shrink-0 relative overflow-hidden border-r border-gray-800"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: QRIOO_PURPLE }}>
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap">
              <p className="font-black text-white text-lg leading-tight">Qrioo</p>
              <p className="text-[10px] text-gray-500">Plateforme SaaS</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User info */}
      <div className="px-3 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
            isSuperAdmin ? 'bg-purple-600' : 'bg-amber-500'
          }`}>
            {isSuperAdmin ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name || ''}</p>
                <p className="text-[11px] text-gray-500 truncate">
                  {isSuperAdmin ? 'Super Admin' : user?.agency?.name || 'Admin Agence'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] relative ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`}>{item.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && sidebarOpen && item.badge && (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                  {item.badge}
                </motion.span>
              )}
              {isActive && (
                <motion.div layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ backgroundColor: QRIOO_PURPLE }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <button type="button" onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition min-h-[44px]">
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <AnimatePresence>
            {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Réduire</motion.span>}
          </AnimatePresence>
        </button>
        <button type="button" onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition min-h-[44px]">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Déconnexion</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
