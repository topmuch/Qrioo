'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, Package, Heart, Calendar, Building2, ArrowRight, Sparkles,
  Play, Pause, Volume2, Phone, User, MessageSquare, Send, Loader2,
  CheckCircle2, Maximize, Bed, Home, PartyPopper, MapPin, ExternalLink,
  Eye, ChevronLeft, ChevronRight, Database, Code, Layers, Zap, Shield,
  RotateCcw, Settings2, AlertCircle,
} from 'lucide-react';
import ActivatePratique, { type PratiqueFormData } from '@/components/activate/ActivatePratique';
import ActivateEmotion, { type EmotionFormData } from '@/components/activate/ActivateEmotion';
import ActivateEvenementiel, { type EvenementielFormData } from '@/components/activate/ActivateEvenementiel';
import ActivateImmobilier, { type ImmobilierFormData } from '@/components/activate/ActivateImmobilier';

// ─── Design tokens ──────────────────────────────────────────
const QRIOO_PURPLE = '#7C3AED';
const QRIOO_VIOLET = '#A855F7';
const QRTAGS_BG = '#E3B23C';
const AMBER_ACCENT = '#D97706';

// ─── Types ──────────────────────────────────────────────────
type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

interface PackInfo {
  id: PackType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const PACKS: PackInfo[] = [
  {
    id: 'pratique',
    title: 'Pack Pratique',
    subtitle: 'Objets perdus',
    description: 'Formulaire de contact + redirection WhatsApp pour retrouver les objets perdus. Le comportement classique QRTags.',
    icon: <Package className="w-7 h-7" />,
    color: QRTAGS_BG,
    gradient: 'from-amber-400 to-amber-600',
  },
  {
    id: 'emotion',
    title: 'Pack Emotion',
    subtitle: 'Messages speciaux',
    description: 'Animation enveloppe + lecteur audio personnalise ou message texte. Pour les cadeaux, cartes de voeux, souvenirs.',
    icon: <Heart className="w-7 h-7" />,
    color: QRIOO_PURPLE,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'evenementiel',
    title: 'Pack Evenementiel',
    subtitle: "Livre d'or",
    description: 'Mur de messages interactif pour les evenements : mariages, anniversaires, conferences. Avec enregistrement vocal.',
    icon: <Calendar className="w-7 h-7" />,
    color: '#EC4899',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'immobilier',
    title: 'Pack Immobilier',
    subtitle: 'Fiches biens',
    description: 'Fiche produit elegante avec galerie photo, details du bien, visite virtuelle et formulaire de contact agent.',
    icon: <Building2 className="w-7 h-7" />,
    color: AMBER_ACCENT,
    gradient: 'from-amber-500 to-orange-500',
  },
];

// ─── Mock data for demo previews ─────────────────────────────
const MOCK_EMOTION = {
  contentType: 'audio',
  contentUrl: null,
  contentMetadata: {
    message: 'Joyeux anniversaire ma chérie ! Ce jour est aussi spécial que toi. Je t\'aime plus que tout au monde.',
    duration: 45,
  },
  travelerName: 'Sophie',
};

const MOCK_IMMOBILIER = {
  contentMetadata: {
    title: 'Appartement F3 Vue Mer - Nice',
    description: 'Magnifique appartement T3 de 75m² avec vue panoramique sur la Méditerranée. Situé au 4ème étage avec ascenseur, rénové en 2023. Proche de la Promenade des Anglais et de toutes commodités.',
    price: 385000,
    surface: 75,
    rooms: 3,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    ],
    virtualTourUrl: null,
  },
  travelerName: 'Agence Azur Immo',
};

const MOCK_EVENEMENTIEL = {
  contentMetadata: {
    eventName: 'Mariage de Marie & Thomas',
    eventDate: '2025-09-15',
    guestBookEnabled: true,
  },
  travelerName: 'Marie & Thomas',
  initialMessages: [
    { id: '1', authorName: 'Pierre', content: 'Félicitations aux mariés ! Une magnifique journée.', contentType: 'text', contentUrl: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', authorName: 'Claire', content: 'Tant de bonheur à vous deux ! Que cette vie commune vous apporte tout ce dont vous rêvez.', contentType: 'text', contentUrl: null, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: '3', authorName: 'Lucas', content: 'Le buffet était incroyable ! Merci pour cette superbe soirée.', contentType: 'text', contentUrl: null, createdAt: new Date(Date.now() - 600000).toISOString() },
  ],
};

const MOCK_PRATIQUE = {
  baggage: {
    reference: 'QR-DEMO-001',
    type: 'voyageur',
    travelerName: 'Ahmed Benali',
    travelerFirstName: 'Ahmed',
    status: 'active',
    agency: 'Voyages Sérénité',
    isLost: true,
    objectInfo: {
      category: 'bagage',
      category_label: 'Valise cabine',
      object_name: 'Valise noire Samsonite',
      brand: 'Samsonite',
      color: 'Noir',
      object_description: 'Valise cabine noire avec étiquette rouge',
      message_to_finder: 'Merci d\'avoir trouvé ma valise. Elle contient des documents importants. Récompense garantie !',
      city: 'Paris',
      country: 'France',
    },
  },
};

// ─── Waveform bars generator ────────────────────────────────
const WAVEFORM_BARS = Array.from({ length: 40 }, (_, i) => {
  const seed = (i * 7 + 13) % 17;
  return 0.25 + (seed / 17) * 0.75;
});

// ═══════════════════════════════════════════════════════════════
// ═══ EMOTION DEMO COMPONENT ═══════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function EmotionDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate audio progress
      let p = 0;
      const interval = setInterval(() => {
        p += 0.5;
        if (p >= 100) { clearInterval(interval); setIsPlaying(false); setProgress(0); }
        else setProgress(p);
      }, 100);
      // Store interval to clear on pause
      (EmotionDemo as unknown as { _interval?: NodeJS.Timeout })._interval = interval;
    } else {
      clearInterval((EmotionDemo as unknown as { _interval?: NodeJS.Timeout })._interval);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 30%, #EC4899 70%, #F472B6 100%)' }}
    >
      <div className="p-6 text-center">
        {/* Envelope animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-14 rounded-t-lg bg-white/30 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
            <Heart className="w-7 h-7 text-pink-400" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold text-white mb-1">Sophie vous a envoyé</h3>
        <p className="text-white/80 text-sm mb-4">un message spécial ✨</p>

        {/* Text message */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 mb-4">
          <div className="bg-white/10 rounded-xl p-4 relative">
            <span className="absolute top-1 left-2 text-3xl text-white/20 font-serif leading-none">“</span>
            <span className="absolute bottom-1 right-2 text-3xl text-white/20 font-serif leading-none">”</span>
            <p className="text-white text-sm leading-relaxed font-medium italic pt-3 pb-1 px-2"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Joyeux anniversaire ma chérie ! Ce jour est aussi spécial que toi.
            </p>
          </div>
        </div>

        {/* Audio player */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-white/80" />
            <span className="text-white/80 text-xs font-medium">Message vocal</span>
          </div>
          <div className="flex items-end gap-[2px] h-12 mb-3 px-1">
            {WAVEFORM_BARS.map((height, i) => {
              const barProgress = (i / WAVEFORM_BARS.length) * 100;
              const isActive = barProgress <= progress;
              return (
                <div key={i} className="flex-1 rounded-full transition-all duration-100"
                  style={{ height: `${height * 100}%`, backgroundColor: isActive ? '#FBBF24' : 'rgba(255,255,255,0.25)', minHeight: '3px' }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              {isPlaying ? <Pause className="w-4 h-4 text-purple-700" /> : <Play className="w-4 h-4 text-purple-700 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="text-white/70 text-xs font-mono">0:{String(Math.floor(progress / 100 * 45)).padStart(2, '0')} / 0:45</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ IMMOBILIER DEMO COMPONENT ═══════════════════════════════
// ═══════════════════════════════════════════════════════════════
function ImmobilierDemo() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = MOCK_IMMOBILIER.contentMetadata.images;
  const meta = MOCK_IMMOBILIER.contentMetadata;

  const formatPrice = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span className="text-xs font-medium opacity-80">Qrioo Immobilier</span>
        </div>
        <h3 className="text-lg font-bold mt-1">{meta.title}</h3>
      </div>

      {/* Image gallery */}
      <div className="relative bg-gray-100" style={{ height: '200px' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImage}
            src={images[currentImage]}
            alt={`Photo ${currentImage + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => setCurrentImage((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => setCurrentImage((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} type="button" onClick={() => setCurrentImage(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImage ? 'bg-white w-4' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="px-5 py-4">
        <p className="text-2xl font-black text-amber-700 mb-3">{formatPrice(meta.price)}</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
            <Maximize className="w-4 h-4 mx-auto mb-0.5 text-amber-600" />
            <p className="text-base font-bold text-amber-900">{meta.surface}</p>
            <p className="text-xs text-amber-600">m²</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
            <Bed className="w-4 h-4 mx-auto mb-0.5 text-amber-600" />
            <p className="text-base font-bold text-amber-900">{meta.rooms}</p>
            <p className="text-xs text-amber-600">pièces</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-2 text-center border border-amber-100">
            <Home className="w-4 h-4 mx-auto mb-0.5 text-amber-600" />
            <p className="text-xs font-bold text-amber-900 mt-1">À vendre</p>
            <p className="text-xs text-amber-600">Bien</p>
          </div>
        </div>
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{meta.description}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ EVENEMENTIEL DEMO COMPONENT ═════════════════════════════
// ═══════════════════════════════════════════════════════════════
function EvenementielDemo() {
  const { contentMetadata, initialMessages } = MOCK_EVENEMENTIEL;
  const messages = initialMessages as Array<{ id: string; authorName: string; content: string; createdAt: string }>| undefined;

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 80%, #F472B6 100%)' }}>
        <div className="px-5 py-5 text-center text-white">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-3">
            <PartyPopper className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black mb-1">{contentMetadata.eventName}</h3>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">15 septembre 2025</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4" style={{ color: QRIOO_PURPLE }} />
          <span className="text-sm font-bold text-gray-900">Livre d'or</span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {messages?.length || 0} messages
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {messages?.map((msg) => (
            <div key={msg.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs">
                  {msg.authorName.charAt(0)}
                </div>
                <p className="font-bold text-gray-900 text-xs">{msg.authorName}</p>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed pl-9">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ PRATIQUE DEMO COMPONENT ═════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function PratiqueDemo() {
  const { baggage } = MOCK_PRATIQUE;
  const info = baggage.objectInfo;

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl"
      style={{ backgroundColor: QRTAGS_BG }}>
      <div className="bg-white rounded-xl p-5 mx-3 mt-3 border-2 border-black">
        <div className="bg-red-100 border-b-2 border-red-500 px-3 py-2 rounded-t-xl -mx-5 -mt-5 mb-4">
          <p className="text-red-700 font-bold text-xs text-center">⚠️ Cet objet est signalé perdu</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-base font-black text-black">Objet trouvé</h3>
            <p className="text-xs text-black/60">Ref: {baggage.reference}</p>
          </div>
        </div>
        {info && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="font-bold text-black text-sm">{info.object_name}</p>
            {info.brand && <p className="text-xs text-black/70">Marque: {info.brand}</p>}
            {info.color && <p className="text-xs text-black/70">Couleur: {info.color}</p>}
          </div>
        )}
        {info?.message_to_finder && (
          <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-bold text-amber-800 mb-1">Message du propriétaire :</p>
            <p className="text-xs text-amber-900 italic">{info.message_to_finder}</p>
          </div>
        )}
        <div className="space-y-2">
          <input placeholder="Votre nom *" disabled className="w-full min-h-[40px] px-3 py-2 border-2 border-black rounded-lg bg-gray-100 text-gray-400 text-sm" />
          <input placeholder="Téléphone (optionnel)" disabled className="w-full min-h-[40px] px-3 py-2 border-2 border-black rounded-lg bg-gray-100 text-gray-400 text-sm" />
          <button disabled className="w-full px-4 py-3 rounded-lg font-black text-black/50 transition flex items-center justify-center gap-2 min-h-[44px] cursor-not-allowed bg-black/10">
            <Send className="w-4 h-4" /> Prévenir le propriétaire
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ MAIN PAGE ════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
export default function QriooPage() {
  const [activeTab, setActiveTab] = useState<PackType>('emotion');
  const [scanRef, setScanRef] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // ─── Étape 3 : Activation state ────────────────────────────
  const [activateTab, setActivateTab] = useState<PackType>('pratique');
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateSuccess, setActivateSuccess] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [seedReady, setSeedReady] = useState(false);

  // Demo references for activation testing
  const ACTIVATE_REFS: Record<PackType, string> = {
    pratique: 'ACTIVATE-PRATIQUE-01',
    emotion: 'ACTIVATE-EMOTION-01',
    evenementiel: 'ACTIVATE-EVENT-01',
    immobilier: 'ACTIVATE-IMMO-01',
  };

  // Seed pending tags on mount
  useEffect(() => {
    fetch('/api/seed-activate', { method: 'POST' })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSeedReady(true); })
      .catch(() => {});
  }, []);

  // Generic activate handler
  const handleActivate = useCallback(async (packType: PackType, data: Record<string, unknown>) => {
    setActivateLoading(true);
    setActivateSuccess(null);
    setActivateError(null);
    try {
      const ref = ACTIVATE_REFS[packType];
      const res = await fetch(`/api/activate/${ref}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setActivateSuccess(`Tag ${ref} activé avec succès !`);
      } else {
        setActivateError(result.error || result.details?.[0]?.message || 'Erreur lors de l\'activation');
      }
    } catch {
      setActivateError('Erreur réseau. Vérifiez la connexion.');
    } finally {
      setActivateLoading(false);
    }
  }, []);

  // Reset a tag to pending for re-testing
  const handleResetTag = useCallback(async (packType: PackType) => {
    try {
      const res = await fetch('/api/seed-activate', { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        setActivateSuccess(null);
        setActivateError(null);
      }
    } catch { /* ignore */ }
  }, []);

  const handleScan = useCallback(async () => {
    if (!scanRef.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await fetch(`/api/scan/${scanRef.trim()}`, { cache: 'no-store' });
      const data = await res.json();
      setScanResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setScanResult(JSON.stringify({ error: 'Erreur de connexion' }, null, 2));
    } finally {
      setIsScanning(false);
    }
  }, [scanRef]);

  const demoMap: Record<PackType, React.ReactNode> = {
    emotion: <EmotionDemo />,
    immobilier: <ImmobilierDemo />,
    evenementiel: <EvenementielDemo />,
    pratique: <PratiqueDemo />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ─── HERO ─── */}
      <header className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #6d28d9 100%)' }}>
        {/* Animated grid bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/20">
              <QrCode className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">QR Codes Dynamiques Multi-Usages</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
              Qrioo
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
              Transformez vos QR codes en expériences interactives. Objets perdus, messages émotion, événements et immobilier — tout en un.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="#packs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-900 font-bold text-sm hover:bg-gray-100 transition shadow-lg min-h-[48px]">
                <Sparkles className="w-4 h-4" /> Découvrir les packs
              </a>
              <a href="#scan-test" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition min-h-[48px]">
                <Zap className="w-4 h-4" /> Tester le scan
              </a>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: 'Packs', value: '4', icon: <Layers className="w-5 h-5" /> },
              { label: 'Types de contenu', value: '6', icon: <Code className="w-5 h-5" /> },
              { label: 'Scan ultra-rapide', value: '< 2s', icon: <Zap className="w-5 h-5" /> },
              { label: 'Sécurisé', value: '100%', icon: <Shield className="w-5 h-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">{stat.icon}</div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ─── PACK TYPES CARDS ─── */}
      <section id="packs" className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">4 Packs, des usages infinis</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Chaque QR code peut être configuré avec un pack spécifique pour offrir une expérience adaptée au scanner.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKS.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onClick={() => { setActiveTab(pack.id); document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`group cursor-pointer rounded-2xl p-6 bg-white border-2 hover:shadow-xl transition-all duration-300 ${activeTab === pack.id ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pack.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {pack.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{pack.title}</h3>
                <p className="text-sm font-medium mb-2" style={{ color: pack.color }}>{pack.subtitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{pack.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE DEMO ─── */}
      <section id="demo-section" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Aperçu des packs</h2>
            <p className="text-gray-600">Cliquez sur un pack ci-dessus ou utilisez les onglets pour voir la preview.</p>
          </motion.div>

          {/* Tab bar */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
              {PACKS.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setActiveTab(pack.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all min-h-[44px] ${activeTab === pack.id
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500 hover:text-gray-700' }`}
                >
                  {pack.title}
                </button>
              ))}
            </div>
          </div>

          {/* Demo preview */}
          <div className="max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {demoMap[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── SCAN TEST ─── */}
      <section id="scan-test" className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Tester l'API Scan</h2>
            <p className="text-gray-600">Entrez une référence QR pour tester le routeur dynamique <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">/api/scan/[reference]</code></p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={scanRef}
                onChange={(e) => setScanRef(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="Ex: QR-DEMO-001"
                className="flex-1 min-h-[48px] px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-sm font-mono"
              />
              <button
                type="button"
                onClick={handleScan}
                disabled={isScanning || !scanRef.trim()}
                className="px-6 py-3 rounded-xl font-bold text-white transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl min-h-[48px]"
                style={{ backgroundColor: QRIOO_PURPLE }}
              >
                {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Scan...</> : <><Zap className="w-4 h-4" /> Scanner</>}
              </button>
            </div>

            {scanResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 bg-gray-900 rounded-xl p-4 overflow-auto max-h-80"
              >
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{scanResult}</pre>
              </motion.div>
            )}

            <p className="text-xs text-gray-400 mt-3 text-center">
              L'API route dynamiquement vers le bon handler selon le <code className="bg-gray-100 px-1 rounded">pack_type</code> du QR code (pratique, emotion, evenementiel, immobilier).
            </p>
          </div>
        </div>
      </section>

      {/* ─── MIGRATION SUMMARY ─── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Étape 1 : Migrations Base de Données</h2>
            <p className="text-gray-600">Champs ajoutés au modèle <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">Baggage</code> et nouvelles tables créées.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* New fields on Baggage */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Nouveaux champs (Baggage)</h3>
                  <p className="text-xs text-gray-500">Table : baggage</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'pack_type', type: 'VARCHAR', default: "'pratique'", desc: "ENUM('pratique', 'emotion', 'evenementiel', 'immobilier')" },
                  { name: 'content_type', type: 'VARCHAR', default: 'NULL', desc: "ENUM('text', 'audio', 'video', 'wifi', 'contact', 'url')" },
                  { name: 'content_url', type: 'VARCHAR', default: 'NULL', desc: 'Lien fichier audio/vidéo sur le storage' },
                  { name: 'content_metadata', type: 'TEXT (JSON)', default: 'NULL', desc: 'Données spécifiques au pack' },
                  { name: 'batch_id', type: 'VARCHAR', default: 'NULL', desc: 'Clé étrangère vers Batch' },
                ].map((field) => (
                  <div key={field.name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-bold text-purple-700 font-mono">{field.name}</code>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono">{field.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{field.desc}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Default: <code className="font-mono">{field.default}</code></p>
                  </div>
                ))}
              </div>
            </div>

            {/* New tables */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Table : batches</h3>
                    <p className="text-xs text-gray-500">Génération en masse de QR codes</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[['name', 'VARCHAR', 'Nom du lot'], ['pack_type', 'VARCHAR', 'Type de pack par défaut'], ['quantity', 'INT', 'Nombre de QR codes'], ['agency_id', 'VARCHAR', 'Agence assignée'], ['status', 'VARCHAR', 'draft | generated | distributed | completed'], ['pdf_url', 'VARCHAR', "URL du PDF d'impression"]].map(([name, type, desc]) => (
                    <div key={name} className="flex items-center gap-2 text-gray-700">
                      <code className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{name}</code>
                      <span className="text-gray-400">:</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Table : guest_messages</h3>
                    <p className="text-xs text-gray-500">Livre d’or (Pack Événementiel)</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[["baggage_id", "FK", "QR code de lévénement"], ["author_name", "VARCHAR", "Nom de l'invité"], ["content", "TEXT", "Texte du message"], ["content_url", "VARCHAR", "URL audio/vidéo"], ["content_type", "VARCHAR", "text | audio | video"], ["is_moderated", "BOOLEAN", "Modéré par l'hôte"]].map(([name, type, desc]) => (
                    <div key={name} className="flex items-center gap-2 text-gray-700">
                      <code className="font-mono text-xs font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded">{name}</code>
                      <span className="text-gray-400">:</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECH ARCHITECTURE ─── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">Étape 2 : Routeur Dynamique</h2>
            <p className="text-gray-600">L'API scan détecte le <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">pack_type</code> et renvoie les données adaptées au bon composant frontend.</p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre leading-relaxed">{`// ─── API Route : /api/scan/[reference] ───

switch (packType) {
  case 'pratique':
    // → Formulaire de contact + redirection WhatsApp
    // → Données : objectInfo, isLost, whatsappOwner
    return <PackPratique />

  case 'emotion':
    // → Animation enveloppe + lecteur audio / texte
    // → Données : contentType, contentUrl, contentMetadata
    return <PackEmotion />

  case 'evenementiel':
    // → Livre d'or + messages invités
    // → Données : eventName, eventDate, guestMessages[]
    return <PackEvenementiel />

  case 'immobilier':
    // → Fiche bien + galerie + formulaire agent
    // → Données : title, price, surface, images[]
    return <PackImmobilier />
}`}</pre>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           ÉTAPE 3 : FORMULAIRES D'ACTIVATION DYNAMIQUES
           ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-wider uppercase mb-4">
              <Settings2 className="w-3.5 h-3.5" />
              Étape 3
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Activation Dynamique par Pack
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chaque tag QR a un formulaire d'activation adapté à son <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">pack_type</code>. Remplissez le formulaire ci-dessous pour activer un tag de démonstration. L'API valide et persiste les données selon le schéma du pack.
            </p>
          </motion.div>

          {/* Pack tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {PACKS.map((pack) => {
              const isActive = activateTab === pack.id;
              const ref = ACTIVATE_REFS[pack.id];
              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => { setActivateTab(pack.id); setActivateSuccess(null); setActivateError(null); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {pack.icon}
                  <span>{pack.title}</span>
                  <code className="text-[10px] font-mono opacity-60 ml-1">{ref}</code>
                </button>
              );
            })}
          </div>

          {/* Success / Error banners */}
          <AnimatePresence mode="wait">
            {activateSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-lg mx-auto mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">Activation réussie</p>
                  <p className="text-xs text-emerald-700 mt-0.5">{activateSuccess}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResetTag(activateTab)}
                  className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réinitialiser
                </button>
              </motion.div>
            )}
            {activateError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-lg mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-800">Erreur</p>
                  <p className="text-xs text-red-700 mt-0.5">{activateError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activation form (switched by tab) */}
          <div className="max-w-lg mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activateTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {activateTab === 'pratique' && (
                  <ActivatePratique
                    onSubmit={(data) => handleActivate('pratique', data as unknown as Record<string, unknown>)}
                    isLoading={activateLoading}
                  />
                )}
                {activateTab === 'emotion' && (
                  <ActivateEmotion
                    onSubmit={(data) => handleActivate('emotion', data as unknown as Record<string, unknown>)}
                    isLoading={activateLoading}
                  />
                )}
                {activateTab === 'evenementiel' && (
                  <ActivateEvenementiel
                    onSubmit={(data) => handleActivate('evenementiel', data as unknown as Record<string, unknown>)}
                    isLoading={activateLoading}
                  />
                )}
                {activateTab === 'immobilier' && (
                  <ActivateImmobilier
                    onSubmit={(data) => handleActivate('immobilier', data as unknown as Record<string, unknown>)}
                    isLoading={activateLoading}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Architecture note */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-700">Architecture : Validation par pack_type</h3>
              </div>
              <pre className="text-sm font-mono text-gray-800 whitespace-pre leading-relaxed">{`// ─── API Route : /api/activate/[reference] ───

switch (packType) {
  case 'pratique':
    // → Zod : travelerFirstName, travelerLastName, whatsappOwner
    // → Stocke : customData JSON (category, brand, model...)
    validate(pratiqueSchema)
    break;

  case 'emotion':
    // → Zod : senderName, recipientName, contentType (text|audio)
    // → Stocke : contentMetadata + contentType + contentUrl
    validate(emotionSchema)
    break;

  case 'evenementiel':
    // → Zod : eventName, eventDate, hostName, guestBookEnabled
    // → Stocke : contentMetadata JSON
    validate(evenementielSchema)
    break;

  case 'immobilier':
    // → Zod : propertyTitle, propertyType, price, city
    // → Stocke : contentMetadata JSON (photos[], features[])
    validate(immobilierSchema)
    break;
}`}</pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-white py-10 px-4 mt-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: QRIOO_PURPLE }}>
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-lg">Qrioo</p>
                <p className="text-xs text-gray-400">QR Codes Dynamiques Multi-Usages</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Refonte de QRTags en plateforme SaaS multi-usage
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: QRIOO_PURPLE }} />
              <span className="text-xs text-gray-500">Étapes 1, 2 & 3 : Migrations + Scan + Activation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
