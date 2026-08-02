'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  QrCode, Shield, Zap, BarChart3, Building2, ScanLine,
  Heart, PartyPopper, Home, ArrowRight, X, ChevronRight,
  Mail, Lock, Loader2, Eye, EyeOff, LogIn, Sparkles,
  Layers, Globe, MousePointerClick, FileDown, Users, Play,
  Check, Star, ArrowUpRight,
} from 'lucide-react';
import { useAuthStore, type AuthUser } from '@/store/auth';
import PackDetailPage from '@/components/landing/packs/PackDetailPage';
import FooterPages from '@/components/landing/pages/FooterPages';
import DemoSection from '@/components/landing/DemoSection';

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */

type SubPage =
  | null
  | { type: 'pack'; packType: 'pratique' | 'emotion' | 'evenementiel' | 'immobilier' }
  | { type: 'page'; pageId: string };

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const QRIOO = {
  purple: '#7C3AED',
  'purple-light': '#A78BFA',
  'purple-dark': '#5B21B6',
  amber: '#F59E0B',
  emerald: '#10B981',
  slate: '#64748B',
};

/* ─── Packs ─────────────────────────────────────────────────────── */

const PACKS = [
  {
    name: 'Pratique',
    slug: 'pratique',
    icon: ScanLine,
    color: QRIOO.amber,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    bgLight: 'rgba(245,158,11,0.08)',
    desc: 'Bagages, objets perdus, étiquettes voyage.',
    detail: 'Retrouvez vos affaires en un scan grâce à des QR codes liés à vos informations de contact.',
    examples: ['Valises', 'Cartes de visite', 'Étiquettes', 'Clés'],
  },
  {
    name: 'Émotion',
    slug: 'emotion',
    icon: Heart,
    color: QRIOO.purple,
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    bgLight: 'rgba(124,58,237,0.08)',
    desc: 'Messages, souvenirs, témoignages.',
    detail: 'Créez des connexions émotionnelles uniques avec des contenus personnalisés.',
    examples: ["Livre d'or", 'Voeux', 'Dédicaces', 'Témoignages'],
  },
  {
    name: 'Événementiel',
    slug: 'evenementiel',
    icon: PartyPopper,
    color: QRIOO.emerald,
    gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    bgLight: 'rgba(16,185,129,0.08)',
    desc: 'Weddings, concerts, conférences.',
    detail: 'Digitalisez vos événements avec des QR codes interactifs pour vos invités.',
    examples: ['Mariages', 'Concerts', 'Séminaires', 'Gala'],
  },
  {
    name: 'Immobilier',
    slug: 'immobilier',
    icon: Home,
    color: QRIOO.slate,
    gradient: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)',
    bgLight: 'rgba(71,85,105,0.08)',
    desc: 'Visites virtuelles, fiches biens, contacts.',
    detail: 'Modernisez vos annonces immobilières avec des QR codes sur panneaux et supports.',
    examples: ['Panneaux', 'Brochures', 'Visites', 'Contacts'],
  },
];

/* ─── How it works ──────────────────────────────────────────────── */

const STEPS = [
  { num: '01', title: 'Choisissez votre pack', desc: 'Sélectionnez parmi nos 4 packs spécialisés : Pratique, Émotion, Événementiel ou Immobilier.', icon: Layers },
  { num: '02', title: 'Générez vos QR codes', desc: 'Configurez la quantité et générez vos QR codes personnalisés en un clic.', icon: Sparkles },
  { num: '03', title: 'Activez et suivez', desc: 'Activez le contenu de chaque QR code et suivez les scans en temps réel.', icon: BarChart3 },
];

/* ─── Features ──────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Zap, title: 'Scan instantané', desc: 'QR codes activés en moins de 2 secondes', color: QRIOO.amber },
  { icon: BarChart3, title: 'Dashboard en temps réel', desc: 'Statistiques et activité en direct sur votre tableau de bord', color: QRIOO.purple },
  { icon: Building2, title: 'Multi-agences', desc: 'Gérez plusieurs agences depuis un seul compte super admin', color: QRIOO.emerald },
  { icon: Shield, title: 'Sécurisé', desc: 'Authentification JWT et rôles avancés pour protéger vos données', color: QRIOO.slate },
  { icon: FileDown, title: 'Export PDF & CSV', desc: 'Téléchargez vos lots de QR codes en PDF imprimable ou CSV', color: QRIOO.amber },
  { icon: Users, title: 'Traçabilité complète', desc: 'Suivez chaque QR code : en stock, activé, scanné avec historique', color: QRIOO.purple },
];

/* ─── Testimonials ──────────────────────────────────────────────── */

const TESTIMONIALS = [
  { name: 'Aminata Diallo', role: 'Directrice, Voyages Sérénité', text: 'Qrioo a transformé notre gestion des bagages perdus. Nos clients scannent et nous retrouvons leurs affaires en quelques minutes.', avatar: 'AD', color: QRIOO.amber },
  { name: 'Omar Ba', role: 'Agent, Azur Immo', text: 'Les QR codes sur nos panneaux immobiliers génèrent 3x plus de contacts. Un vrai game-changer pour nos ventes.', avatar: 'OB', color: QRIOO.slate },
  { name: 'Fatou Sow', role: 'Wedding Planner', text: "Le pack Événementiel est magique. Les invités scannent, laissent des messages, et les couples gardent un souvenir unique.", avatar: 'FS', color: QRIOO.purple },
];

/* ─── Demo accounts ─────────────────────────────────────────────── */

const DEMO_ACCOUNTS = [
  { email: 'superadmin@qrioo.com', password: 'admin123', role: 'SUPERADMIN' },
  { email: 'admin@voyages-serenite.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Voyages Sérénité' },
  { email: 'admin@azur-immo.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Azur Immo' },
];

/* ================================================================== */
/*  ANIMATIONS                                                         */
/* ================================================================== */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ================================================================== */
/*  SECTION WRAPPER                                                    */
/* ================================================================== */

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subPage, setSubPage] = useState<SubPage>(null);
  const { login } = useAuthStore();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [mounted] = useState(() => typeof window !== 'undefined');

  // Scroll to top when sub-page changes
  useEffect(() => {
    if (subPage) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [subPage]);

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

  const handleDemoLogin = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleDemoAutoLogin = useCallback((demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setShowLogin(true);
    // Auto-submit after a short delay
    setTimeout(() => {
      const form = document.querySelector('form[data-login-form]') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
  }, []);

  const goBack = useCallback(() => {
    setSubPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Sub-page: Pack detail ──
  if (subPage?.type === 'pack') {
    return (
      <PackDetailPage
        packType={subPage.packType}
        onBack={goBack}
        onCTA={() => setShowLogin(true)}
      />
    );
  }

  // ── Sub-page: Footer pages ──
  if (subPage?.type === 'page') {
    return <FooterPages pageId={subPage.pageId} onBack={goBack} />;
  }

  // ── Main landing page ──
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* ============================================================= */}
      {/*  NAVBAR                                                        */}
      {/* ============================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{ backdropFilter: 'blur(16px) saturate(180%)', WebkitBackdropFilter: 'blur(16px) saturate(180%)', backgroundColor: 'rgba(255,255,255,0.82)' }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200"
              style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">Qrioo</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#packs" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">Packs</a>
            <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">Démo</a>
            <a href="#how" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">Comment ça marche</a>
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">Fonctionnalités</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition">Témoignages</a>
          </nav>
          <button
            onClick={() => setShowLogin(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-200 hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
          >
            Connexion
          </button>
        </div>
      </header>

      {/* ============================================================= */}
      {/*  HERO                                                          */}
      {/* ============================================================= */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-18">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
            style={{ background: 'radial-gradient(circle, #A855F7, transparent 70%)' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
            style={{ background: 'radial-gradient(circle, #F59E0B, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'radial-gradient(circle, #7C3AED 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              {mounted && (
                <motion.div variants={stagger} initial="hidden" animate="visible">
                  <motion.div variants={fadeUp} transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-8"
                    style={{ borderColor: '#E9D5FF', color: QRIOO.purple, backgroundColor: '#FAF5FF' }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    La nouvelle ère des QR codes dynamiques
                  </motion.div>

                  <motion.h1 variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-black text-gray-900 tracking-tight leading-[1.08]"
                  >
                    Créez des QR codes{' '}
                    <span className="relative">
                      <span className="relative z-10 bg-gradient-to-r from-purple-600 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                        uniques
                      </span>
                    </span>
                    <br />
                    qui racontent votre{' '}
                    <span className="relative">
                      <span className="relative z-10 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        histoire
                      </span>
                    </span>
                  </motion.h1>

                  <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl leading-relaxed"
                  >
                    Créez, gérez et suivez vos QR codes dynamiques sur une seule plateforme.
                    Objets perdus, émotions, événements et immobilier — tout est possible.
                  </motion.p>

                  <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      onClick={() => setShowLogin(true)}
                      className="w-full sm:w-auto group relative px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:shadow-2xl hover:shadow-purple-300/40 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5"
                      style={{ background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6D28D9 100%)' }}
                    >
                      Commencer gratuitement
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full sm:w-auto group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-gray-700 text-base border-2 border-gray-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50/50 transition-all duration-300"
                    >
                      <Play className="w-4 h-4" />
                      Essayer la démo
                    </button>
                  </motion.div>

                  <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }} className="mt-12 flex items-center gap-6">
                    <div className="flex -space-x-2.5">
                      {['AD', 'OB', 'FS', 'MK'].map((initials, i) => (
                        <div key={initials} className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${
                          i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-500' : i === 2 ? 'bg-purple-500' : 'bg-emerald-500'
                        }`} style={{ zIndex: 4 - i }}>
                          {initials}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Utilisé par des agences à travers l'Afrique</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {mounted && (
              <motion.div
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative hidden lg:block"
              >
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-200/30 border border-white/60">
                    <img src="/hero-illustration.png" alt="Qrioo Dashboard" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -left-8 top-1/3 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
                      <ScanLine className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900">2,847</p>
                      <p className="text-[11px] text-gray-400">Scans ce mois</p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100">
                      <QrCode className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900">12,400+</p>
                      <p className="text-[11px] text-gray-400">QR codes créés</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
            <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </div>
        </motion.div>
      </section>

      {/* ============================================================= */}
      {/*  TRUSTED BY BAR                                                */}
      {/* ============================================================= */}
      <Section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p variants={fadeIn} transition={{ duration: 0.5 }} className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
            Conçu pour les professionnels
          </motion.p>
          <motion.div variants={stagger} className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Agences de voyage', 'Immobilier', 'Wedding Planners', 'Événementiel', 'Hôtellerie'].map((sector) => (
              <motion.span key={sector} variants={fadeUp} transition={{ duration: 0.4 }}
                className="text-sm font-semibold text-gray-300 hover:text-gray-500 transition">
                {sector}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  PACKS                                                         */}
      {/* ============================================================= */}
      <Section id="packs" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: QRIOO.purple, backgroundColor: '#FAF5FF' }}>
              <Layers className="w-3 h-3" /> Packs
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              Un QR code pour{' '}
              <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">chaque besoin</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              4 packs spécialisés couvrent tous vos cas d'usage professionnels.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PACKS.map((pack) => {
              const Icon = pack.icon;
              return (
                <motion.div
                  key={pack.name}
                  variants={scaleIn}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  onClick={() => setSubPage({ type: 'pack', packType: pack.slug as 'pratique' | 'emotion' | 'evenementiel' | 'immobilier' })}
                  className="group relative rounded-3xl p-7 border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: pack.gradient }} />

                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: pack.gradient }}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pack.name}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{pack.desc}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {pack.examples.map((ex) => (
                      <span key={ex} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                        style={{ color: pack.color, backgroundColor: pack.bgLight }}>
                        {ex}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight className="w-5 h-5" style={{ color: pack.color }} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  DEMO SECTION                                                  */}
      {/* ============================================================= */}
      <DemoSection onLogin={handleDemoAutoLogin} />

      {/* ============================================================= */}
      {/*  HOW IT WORKS                                                  */}
      {/* ============================================================= */}
      <Section id="how" className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: QRIOO.emerald, backgroundColor: '#ECFDF5' }}>
              <MousePointerClick className="w-3 h-3" /> Simple
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              Comment ça{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">marche</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Trois étapes simples pour commencer à utiliser Qrioo.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-purple-200 via-emerald-200 to-amber-200" />

            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.num} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-gray-100 shadow-lg shadow-gray-100/50 flex items-center justify-center relative z-10">
                      <Icon className="w-7 h-7" style={{ color: [QRIOO.purple, QRIOO.emerald, QRIOO.amber][i] }} />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white z-20"
                      style={{ background: [QRIOO.purple, QRIOO.emerald, QRIOO.amber][i] }}>
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  FEATURES                                                      */}
      {/* ============================================================= */}
      <Section id="features" className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: QRIOO.amber, backgroundColor: '#FFFBEB' }}>
              <Zap className="w-3 h-3" /> Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              Tout ce qu'il vous{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">faut</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
              Une plateforme complète pour créer, gérer et tracer vos QR codes.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => setSubPage({ type: 'page', pageId: 'fonctionnalites' })}
                  className="group flex gap-4 p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:shadow-gray-100/50 hover:border-gray-200 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${feat.color}12`, color: feat.color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">{feat.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  STATS                                                         */}
      {/* ============================================================= */}
      <Section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={scaleIn} transition={{ duration: 0.6 }}
            className="rounded-3xl p-10 sm:p-14 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #5B21B6 100%)' }}
          >
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-purple-400/20 blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-400/20 blur-[60px]" />

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: '4', suffix: '', label: 'Packs spécialisés', color: '#A78BFA' },
                { value: '<2', suffix: 's', label: 'Temps de scan', color: '#FBBF24' },
                { value: '24', suffix: '/7', label: 'Disponibilité', color: '#34D399' },
                { value: '∞', suffix: '', label: 'QR codes possibles', color: '#F472B6' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-black" style={{ color: stat.color }}>
                    {stat.value}<span className="text-xl">{stat.suffix}</span>
                  </p>
                  <p className="text-sm text-white/50 mt-2 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  TESTIMONIALS                                                  */}
      {/* ============================================================= */}
      <Section id="testimonials" className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: '#EC4899', backgroundColor: '#FDF2F8' }}>
              <Star className="w-3 h-3" /> Témoignages
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              Ce qu'en disent nos{' '}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">utilisateurs</span>
            </h2>
          </motion.div>

          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  CTA                                                           */}
      {/* ============================================================= */}
      <Section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={scaleIn}
            transition={{ duration: 0.6 }}
            className="rounded-[2rem] p-10 sm:p-16 lg:p-20 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)' }}
          >
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-purple-500/10 blur-[100px]" />
            <div className="absolute -bottom-20 right-0 w-40 h-40 rounded-full bg-amber-400/10 blur-[60px]" />

            <div className="relative z-10">
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-semibold text-white/80 mb-8"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Prêt à transformer votre activité ?
              </motion.div>

              <motion.h2 variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight"
              >
                Commencez à créer vos
                <br />
                QR codes dès maintenant
              </motion.h2>

              <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/50 mb-10 max-w-xl mx-auto"
              >
                Rejoignez les agences qui utilisent déjà Qrioo pour gérer leurs QR codes dynamiques.
              </motion.p>

              <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-purple-700 text-base bg-white hover:bg-gray-50 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2.5"
                >
                  Accéder à Qrioo
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white text-base border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2.5"
                >
                  <Play className="w-4 h-4" />
                  Voir la démo
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ============================================================= */}
      {/*  FOOTER                                                        */}
      {/* ============================================================= */}
      <footer className="border-t border-gray-100 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-gray-900">Qrioo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Plateforme SaaS de QR codes dynamiques. Créez, gérez et suivez vos QR codes en toute simplicité.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Produit</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'fonctionnalites' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Fonctionnalités</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'tarifs' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Tarifs</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'api' })} className="text-sm text-gray-400 hover:text-purple-600 transition">API</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Entreprise</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'apropos' })} className="text-sm text-gray-400 hover:text-purple-600 transition">À propos</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'blog' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Blog</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'carrieres' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Carrières</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'contact' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Légal</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'confidentialite' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Confidentialité</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'cgu' })} className="text-sm text-gray-400 hover:text-purple-600 transition">CGU</button></li>
                <li><button onClick={() => setSubPage({ type: 'page', pageId: 'mentions-legales' })} className="text-sm text-gray-400 hover:text-purple-600 transition">Mentions légales</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Qrioo. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs text-gray-400">Fait avec passion en Afrique</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================= */}
      {/*  LOGIN MODAL                                                    */}
      {/* ============================================================= */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowLogin(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #A855F7, #7C3AED, #F59E0B)' }} />

              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}>
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Connexion</h2>
                    <p className="text-xs text-gray-400">Accédez à votre espace Qrioo</p>
                  </div>
                </div>

                <form onSubmit={handleLogin} data-login-form className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full min-h-[48px] pl-11 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full min-h-[48px] pl-11 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full min-h-[48px] rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-200 hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> Se connecter</>}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] text-center mb-3">Comptes démo</p>
                  <div className="space-y-1">
                    {DEMO_ACCOUNTS.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => handleDemoLogin(account)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-sm ${
                          account.role === 'SUPERADMIN' ? 'bg-purple-600' : 'bg-amber-500'
                        }`}>
                          {account.role === 'SUPERADMIN' ? 'SA' : 'AA'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{account.agency || 'Super Admin'}</p>
                          <p className="text-[11px] text-gray-400 truncate">{account.email}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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
