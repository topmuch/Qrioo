import { create } from 'zustand';

export type UserRole = 'SUPERADMIN' | 'ADMIN_AGENCE';
export type AppView = 'dashboard' | 'studio' | 'qrcodes' | 'agences' | 'scan' | 'settings';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId: string | null;
  agency?: { id: string; name: string; slug: string; city?: string; country?: string } | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: AppView;
  sidebarOpen: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setView: (view: AppView) => void;
  toggleSidebar: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('qrioo_token') : null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentView: 'dashboard',
  sidebarOpen: true,

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('qrioo_token', token);
      else localStorage.removeItem('qrioo_token');
    }
    set({ token });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: (token, user) => {
    if (typeof window !== 'undefined') localStorage.setItem('qrioo_token', token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('qrioo_token');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false, currentView: 'dashboard' });
  },

  setLoading: (isLoading) => set({ isLoading }),
  setView: (currentView) => set({ currentView }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
