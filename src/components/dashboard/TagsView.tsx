'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Loader2, Search, Package, Heart, Calendar, Building2, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const PACKS = [
  { id: 'pratique', title: 'Pratique', color: '#E3B23C', icon: <Package className="w-3.5 h-3.5" /> },
  { id: 'emotion', title: 'Émotion', color: '#7C3AED', icon: <Heart className="w-3.5 h-3.5" /> },
  { id: 'evenementiel', title: 'Événementiel', color: '#059669', icon: <Calendar className="w-3.5 h-3.5" /> },
  { id: 'immobilier', title: 'Immobilier', color: '#475569', icon: <Building2 className="w-3.5 h-3.5" /> },
];

export default function TagsView() {
  const { token } = useAuthStore();
  const [tags, setTags] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchTags = useCallback(async () => {
    const q = new URLSearchParams();
    if (filter !== 'all') q.set('status', filter);
    if (search) q.set('search', search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    try {
      const res = await fetch(`/api/batches${qs}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const d = await res.json();
      // For now, show batch info since we don't have a dedicated tags list endpoint
      // Tags are shown inside batch expansions
    } catch { /* ignore */ }
    setLoading(false);
  }, [token, filter, search]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Mes Tags</h1>
        <p className="text-sm text-gray-500 mt-0.5">Consultez et gérez vos QR codes</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <QrCode className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">Gestion des tags</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Vos tags QR sont organisés par lots. Allez dans l'onglet <strong>"Lots QR"</strong> pour voir et développer chaque lot.
        </p>
        <div className="flex justify-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-amber-700 font-medium">En stock</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-emerald-700 font-medium">Activé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
