'use client';

import { useRef, type LucideIcon } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ScanLine, Heart, PartyPopper, ArrowRight,
  Luggage, CreditCard, Tag, Key,
  MessageSquare, BookOpen, Quote, Camera,
  Mic2, Building, Eye, FileText, LayoutDashboard,
  BarChart3, Users,
  Play, Sparkles, QrCode,
  MapPin, Phone,
} from 'lucide-react';
import SubPageLayout from '../SubPageLayout';

/* ================================================================== */
/*  TYPES                                                              */
/* ================================================================== */

type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

interface PackDetailPageProps {
  packType: PackType;
  onBack: () => void;
  onCTA: () => void;
}

/* ================================================================== */
/*  ANIMATIONS                                                         */
/* ================================================================== */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ================================================================== */
/*  PACK DATA                                                          */
/* ================================================================== */

interface UsageCard {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

interface Advantage {
  emoji: string;
  title: string;
  desc: string;
}

interface PackData {
  badge: string;
  badgeColor: string;
  gradient: string;
  title: string;
  subtitle: string;
  usages: UsageCard[];
  steps: StepItem[];
  advantages: Advantage[];
  ctaLabel: string;
}

const PACKS: Record<PackType, PackData> = {
  pratique: {
    badge: 'Pack Pratique',
    badgeColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    title: 'Retrouvez vos affaires en un scan',
    subtitle:
      'Ne perdez plus jamais vos affaires. Grâce à nos étiquettes QR, chaque objet retrouvé peut vous être rendu en quelques secondes. Idéal pour les voyageurs, les professionnels et tous ceux qui veulent protéger leurs biens.',
    usages: [
      {
        icon: Luggage,
        title: 'Valises & Bagages',
        desc: 'Identifiez vos valises avec un QR code. En cas de perte, le trouveur scanne et vous contacte immédiatement.',
      },
      {
        icon: CreditCard,
        title: 'Cartes de visite',
        desc: 'Transformez vos cartes de visite en passerelles numériques. Vos contacts accèdent à votre profil en un scan.',
      },
      {
        icon: Tag,
        title: 'Étiquettes voyage',
        desc: 'Collez un QR code sur vos sacs, sacoches et accessoires de voyage pour une sécurité totale en déplacement.',
      },
      {
        icon: Key,
        title: 'Clés & Objets',
        desc: 'Protégez vos clés, portefeuilles et objets du quotidien avec des étiquettes QR discrètes et résistantes.',
      },
    ],
    steps: [
      {
        num: '01',
        icon: Sparkles,
        title: 'Créez vos étiquettes',
        desc: 'Générez vos QR codes personnalisés depuis le dashboard. Choisissez la quantité et téléchargez en PDF.',
      },
      {
        num: '02',
        icon: QrCode,
        title: 'Attachez-les',
        desc: 'Imprimez et collez vos étiquettes sur vos objets, valises, clés ou tout autre bien à protéger.',
      },
      {
        num: '03',
        icon: ScanLine,
        title: 'Scannez pour retrouver',
        desc: 'En cas de perte, le trouveur scanne le QR code et accède directement à vos informations de contact.',
      },
    ],
    advantages: [
      { emoji: '🎯', title: 'Identification instantanée', desc: 'Scan en moins de 2 secondes pour accéder aux coordonnées du propriétaire.' },
      { emoji: '🔔', title: 'Notification en temps réel', desc: 'Recevez une alerte dès que votre QR code est scanné.' },
      { emoji: '📊', title: 'Suivi complet', desc: 'Historique des scans avec localisation et date pour chaque objet.' },
      { emoji: '🏷️', title: 'Personnalisation', desc: 'Personnalisez le contenu de chaque étiquette selon vos besoins.' },
    ],
    ctaLabel: 'Essayer le Pack Pratique',
  },

  emotion: {
    badge: 'Pack Émotion',
    badgeColor: '#7C3AED',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    title: 'Transformez vos émotions en souvenirs',
    subtitle:
      'Créez des moments inoubliables grâce à des QR codes qui racontent une histoire. Messages personnalisés, livres d’or digitaux, témoignages et souvenirs — tout devient possible avec le Pack Émotion.',
    usages: [
      {
        icon: MessageSquare,
        title: 'Messages personnalisés',
        desc: 'Laissez un message caché derrière un QR code : vidéo, audio ou texte. Parfait pour les cadeaux et surprises.',
      },
      {
        icon: BookOpen,
        title: 'Livre d’or digital',
        desc: 'Remplacez le livre d’or papier par une expérience interactive. Vos invités laissent des messages en scannant un QR code.',
      },
      {
        icon: Quote,
        title: 'Témoignages clients',
        desc: 'Collectez des avis authentiques de vos clients via un QR code placé sur vos supports physiques.',
      },
      {
        icon: Camera,
        title: 'Souvenirs d’événements',
        desc: 'Créez des galeries photo partagées accessibles par QR code pour vos mariages, anniversaires et événements.',
      },
    ],
    steps: [
      {
        num: '01',
        icon: Heart,
        title: 'Choisissez votre émotion',
        desc: 'Sélectionnez le type de contenu émotionnel : message, livre d’or, témoignage ou souvenir.',
      },
      {
        num: '02',
        icon: Sparkles,
        title: 'Personnalisez le contenu',
        desc: 'Rédigez votre message, ajoutez des médias et configurez l’apparence de la page de destination.',
      },
      {
        num: '03',
        icon: Play,
        title: 'Partagez l’expérience',
        desc: 'Imprimez le QR code et placez-le sur vos supports. Chaque scan révèle votre contenu émotionnel.',
      },
    ],
    advantages: [
      { emoji: '💬', title: 'Messages illimités', desc: 'Espace de stockage généreux pour tous vos contenus émotionnels.' },
      { emoji: '🎨', title: 'Design personnalisé', desc: 'Page de destination personnalisable aux couleurs de votre événement.' },
      { emoji: '📱', title: 'Mobile-first', desc: 'Expérience optimale sur tous les appareils, sans application à installer.' },
      { emoji: '🔒', title: 'Privé et sécurisé', desc: 'Contrôlez qui peut voir et contribuer à vos contenus émotionnels.' },
    ],
    ctaLabel: 'Essayer le Pack Émotion',
  },

  evenementiel: {
    badge: 'Pack Événementiel',
    badgeColor: '#10B981',
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    title: 'Équipez vos événements de QR codes magiques',
    subtitle:
      'Digitalisez vos événements avec des QR codes interactifs pour vos invités. Programmes, votes en direct, collections de photos et bien plus — le Pack Événementiel transforme chaque occasion en expérience mémorable.',
    usages: [
      {
        icon: PartyPopper,
        title: 'Mariages',
        desc: 'Programme de la cérémonie, album photo partagé, livre d’or digital et messages vidéo pour les mariés.',
      },
      {
        icon: Mic2,
        title: 'Conférences',
        desc: 'Accès aux présentations, évaluation des sessions et réseautage entre participants via QR codes.',
      },
      {
        icon: Users,
        title: 'Festivals',
        desc: 'Carte interactive, programmes artistes, food trucks et votes pour la meilleure performance en temps réel.',
      },
      {
        icon: Building,
        title: 'Événements corporate',
        desc: 'Séminaires, team building et lancements de produit avec engagement numérique mesurable.',
      },
    ],
    steps: [
      {
        num: '01',
        icon: LayoutDashboard,
        title: 'Planifiez votre événement',
        desc: 'Créez votre événement dans le dashboard et configurez les QR codes selon vos besoins.',
      },
      {
        num: '02',
        icon: QrCode,
        title: 'Générez les QR codes',
        desc: 'Créez des QR codes pour chaque point d’interaction : tables, entrées, supports visuels.',
      },
      {
        num: '03',
        icon: BarChart3,
        title: 'Mesurez l’engagement',
        desc: 'Suivez les scans en temps réel et analysez la participation à chaque point de contact.',
      },
    ],
    advantages: [
      { emoji: '⚡', title: 'Mise en place rapide', desc: 'Configurez et déployez vos QR codes en quelques minutes seulement.' },
      { emoji: '📊', title: 'Analytiques en direct', desc: 'Dashboard en temps réel pour suivre l’engagement de vos invités.' },
      { emoji: '🎭', title: 'Multi-usage', desc: 'Programmes, votes, photos, feedback — un seul QR code, plusieurs interactions.' },
      { emoji: '🛡️', title: 'Zéro application requise', desc: 'Vos invités n’ont besoin que de leur téléphone pour participer.' },
    ],
    ctaLabel: 'Essayer le Pack Événementiel',
  },

  immobilier: {
    badge: 'Pack Immobilier',
    badgeColor: '#64748B',
    gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    title: 'Révolutionnez vos visites immobilières',
    subtitle:
      'Modernisez vos annonces immobilières avec des QR codes sur panneaux, brochures et supports physiques. Visites virtuelles, fiches détaillées et contact direct — le Pack Immobilier génère 3x plus de prospects.',
    usages: [
      {
        icon: MapPin,
        title: 'Panneaux de vente',
        desc: 'Collez un QR code sur chaque panneau de vente. Les passants scannent et découvrent le bien sans attendre.',
      },
      {
        icon: Eye,
        title: 'Visites virtuelles',
        desc: 'Dirigez les prospects vers une visite virtuelle 360° du bien en un seul scan depuis la rue.',
      },
      {
        icon: FileText,
        title: 'Fiches bien',
        desc: 'Fiches complètes avec photos, prix, surface et plans. Toujours à jour, sans réimpression.',
      },
      {
        icon: LayoutDashboard,
        title: 'Plaquettes agence',
        desc: 'QR codes sur vos brochures et flyers pour rediriger vers votre catalogue complet de biens.',
      },
    ],
    steps: [
      {
        num: '01',
        icon: Building,
        title: 'Ajoutez vos biens',
        desc: 'Renseignez les informations de chaque bien : photos, prix, surface, description et visites virtuelles.',
      },
      {
        num: '02',
        icon: QrCode,
        title: 'Générez les QR codes',
        desc: 'Créez un QR code unique par bien. Téléchargez en PDF et imprimez pour vos panneaux.',
      },
      {
        num: '03',
        icon: Phone,
        title: 'Recevez des prospects',
        desc: 'Les visiteurs scannent, consultent la fiche et vous contactent directement. Suivez les leads en temps réel.',
      },
    ],
    advantages: [
      { emoji: '📈', title: '3x plus de contacts', desc: 'Les QR codes sur panneaux génèrent significativement plus de demandes de renseignement.' },
      { emoji: '🕐', title: 'Disponible 24h/24', desc: 'Vos biens sont consultables à toute heure, même quand l’agence est fermée.' },
      { emoji: '🔄', title: 'Contenu dynamique', desc: 'Modifiez les infos du bien sans changer le QR code. Toujours à jour.' },
      { emoji: '🏠', title: 'Multi-biens', desc: 'Gérez tous vos biens depuis un seul dashboard avec suivi individuel.' },
    ],
    ctaLabel: 'Essayer le Pack Immobilier',
  },
};

/* ================================================================== */
/*  SECTION WRAPPER                                                    */
/* ================================================================== */

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
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
/*  SECTION TITLE                                                      */
/* ================================================================== */

function SectionTitle({
  children,
  gradient,
}: {
  children: string;
  gradient: string;
}) {
  return (
    <motion.h2
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="text-2xl sm:text-3xl font-black tracking-tight mb-3"
    >
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: gradient }}
      >
        {children}
      </span>
    </motion.h2>
  );
}

/* ================================================================== */
/*  USAGE CARD                                                         */
/* ================================================================== */

function UsageCardItem({
  item,
  gradient,
}: {
  item: UsageCard;
  gradient: string;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg transition-all duration-300 group"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ background: gradient }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
    </motion.div>
  );
}

/* ================================================================== */
/*  STEP CARD                                                          */
/* ================================================================== */

function StepCardItem({
  step,
  gradient,
  color,
  isLast,
}: {
  step: StepItem;
  gradient: string;
  color: string;
  isLast: boolean;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="relative flex gap-5"
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[22px] top-12 w-0.5 h-[calc(100%-24px)]"
          style={{ backgroundColor: `${color}22` }}
        />
      )}
      {/* Step number + icon */}
      <div className="relative flex-shrink-0">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg"
          style={{ background: gradient }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {/* Content */}
      <div className="pt-1.5 pb-8">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color }}
        >
          Étape {step.num}
        </span>
        <h3 className="text-lg font-bold text-gray-900 mt-1 mb-1.5">
          {step.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  ADVANTAGE CARD                                                     */
/* ================================================================== */

function AdvantageCard({
  item,
  gradient,
}: {
  item: Advantage;
  gradient: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
          style={{ background: `${gradient}15` }}
        >
          {item.emoji}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {item.title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  PACK CONTENT                                                       */
/* ================================================================== */

function PackContent({ data, onCTA }: { data: PackData; onCTA: () => void }) {
  const { gradient, badgeColor, usages, steps, advantages, ctaLabel } = data;
  const color = badgeColor;

  return (
    <div className="space-y-20 sm:space-y-24">
      {/* ── Cas d’usage ─────────────────────────────────────── */}
      <AnimatedSection>
        <SectionTitle gradient={gradient}>Cas d’usage</SectionTitle>
        <p className="text-gray-500 mb-8 max-w-xl">
          Découvrez toutes les façons d’utiliser le {data.badge} dans votre quotidien professionnel ou personnel.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {usages.map((u) => (
            <UsageCardItem key={u.title} item={u} gradient={gradient} />
          ))}
        </div>
      </AnimatedSection>

      {/* ── Comment ça marche ──────────────────────────────────── */}
      <AnimatedSection>
        <SectionTitle gradient={gradient}>Comment ça marche</SectionTitle>
        <p className="text-gray-500 mb-10 max-w-xl">
          Trois étapes simples pour commencer à utiliser vos QR codes {data.badge.replace('Pack ', '')}.
        </p>
        <div className="max-w-xl">
          {steps.map((step, i) => (
            <StepCardItem
              key={step.num}
              step={step}
              gradient={gradient}
              color={color}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </AnimatedSection>

      {/* ── Avantages ──────────────────────────────────────────── */}
      <AnimatedSection>
        <SectionTitle gradient={gradient}>Avantages</SectionTitle>
        <p className="text-gray-500 mb-8 max-w-xl">
          Ce qui rend le {data.badge} unique et indispensable pour votre activité.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {advantages.map((a) => (
            <AdvantageCard key={a.title} item={a} gradient={gradient} />
          ))}
        </div>
      </AnimatedSection>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <AnimatedSection>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)' }}
        >
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Glow orb */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 blur-[80px]"
            style={{ background: color }}
          />

          <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Prêt à commencer ?
              </h3>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Créez votre premier lot de QR codes en quelques minutes et
                transformez votre façon de {data.badge === 'Pack Pratique' ? 'protéger vos biens' : data.badge === 'Pack Émotion' ? 'partager vos émotions' : data.badge === 'Pack Événementiel' ? 'gérer vos événements' : 'présenter vos biens immobiliers'}.
              </p>
            </div>
            <button
              onClick={onCTA}
              className="w-full sm:w-auto group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] flex-shrink-0"
              style={{ background: gradient }}
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </AnimatedSection>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */

export default function PackDetailPage({ packType, onBack, onCTA }: PackDetailPageProps) {
  const data = PACKS[packType];
  if (!data) return null;

  return (
    <SubPageLayout
      badge={data.badge}
      badgeColor={data.badgeColor}
      title={data.title}
      subtitle={data.subtitle}
      onBack={onBack}
    >
      <PackContent data={data} onCTA={onCTA} />
    </SubPageLayout>
  );
}
