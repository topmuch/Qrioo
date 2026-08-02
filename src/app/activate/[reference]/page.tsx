'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Loader2,
  AlertCircle,
  ShieldOff,
  CheckCircle2,
  Zap,
} from 'lucide-react';

import ActivatePratique, {
  type PratiqueFormData,
} from '@/components/activate/ActivatePratique';
import ActivateEmotion, {
  type EmotionFormData,
} from '@/components/activate/ActivateEmotion';
import ActivateEvenementiel, {
  type EvenementielFormData,
} from '@/components/activate/ActivateEvenementiel';
import ActivateImmobilier, {
  type ImmobilierFormData,
} from '@/components/activate/ActivateImmobilier';

// ─── Constants ──────────────────────────────────────────────

const QRIOO_PURPLE = '#7C3AED';

type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

type ViewState =
  | 'loading'
  | 'not_found'
  | 'blocked'
  | 'already_active'
  | 'activating'
  | 'form'
  | 'error';

interface ActivateData {
  reference: string;
  packType: PackType;
  status: string;
  canActivate: boolean;
  alreadyActive: boolean;
  agency?: { id: string; name: string } | null;
}

// ─── Pack labels ────────────────────────────────────────────

const PACK_LABELS: Record<PackType, { label: string; emoji: string; description: string }> = {
  pratique: {
    label: 'Pack Pratique',
    emoji: '🧳',
    description: 'Protection anti-perte pour vos objets et bagages',
  },
  emotion: {
    label: 'Pack Emotion',
    emoji: '💌',
    description: 'Messages surprises en texte ou audio',
  },
  evenementiel: {
    label: 'Pack \u00c9v\u00e9nementiel',
    emoji: '\u{1F389}',
    description: 'Invitations et livre d\'or pour vos \u00e9v\u00e9nements',
  },
  immobilier: {
    label: 'Pack Immobilier',
    emoji: '\u{1F3E0}',
    description: 'Fiches de biens immobiliers',
  },
};

// ─── Shared Logo ─────────────────────────────────────────────

function QriooLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
        style={{ backgroundColor: QRIOO_PURPLE }}
      >
        <QrCode className="w-6 h-6 text-white" />
      </div>
      <span className="text-2xl font-black text-gray-900 tracking-tight">
        Qrioo
      </span>
    </div>
  );
}

// ─── Shared Footer ────────────────────────────────────────────

function QriooFooter() {
  return (
    <div className="mt-auto pt-8 pb-6">
      <p className="text-gray-400 text-xs">
        Propuls\u00e9 par{' '}
        <span className="font-bold text-gray-600">Qrioo</span>
      </p>
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-6"
      >
        <QriooLogo />

        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: QRIOO_PURPLE }}
          />
          <p className="text-sm text-gray-500 font-medium">
            V\u00e9rification du tag en cours...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────

function NotFoundView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <QriooLogo className="mb-10" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: '#F3F0FF' }}
          >
            <QrCode
              className="w-12 h-12"
              style={{ color: QRIOO_PURPLE, opacity: 0.4 }}
            />
          </div>
        </motion.div>

        <h1 className="text-5xl font-black mb-3" style={{ color: QRIOO_PURPLE }}>
          404
        </h1>
        <p className="text-lg font-bold text-gray-800 mb-2">
          Tag non trouv\u00e9
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ce QR code ne correspond \u00e0 aucun tag Qrioo. V\u00e9rifiez le code et r\u00e9essayez.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Blocked View ─────────────────────────────────────────────

function BlockedView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <QriooLogo className="mb-10" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-28 h-28 rounded-full flex items-center justify-center bg-red-50 shadow-lg">
            <ShieldOff className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Tag bloqu\u00e9</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ce tag Qrioo a \u00e9t\u00e9 d\u00e9sactiv\u00e9 par son propri\u00e9taire ou par un administrateur.
          Il ne peut plus \u00eatre activ\u00e9.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Already Active / Activating Success View ─────────────────

function SuccessView({ reference }: { reference: string }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(`/scan/${reference}`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [reference, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <QriooLogo className="mb-10" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: '#F0FDF4' }}
          >
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
        </motion.div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Tag activ\u00e9 !</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Votre tag Qrioo est maintenant actif. Redirection en cours...
        </p>

        <div className="mt-6">
          <Loader2
            className="w-5 h-5 animate-spin text-gray-400"
          />
        </div>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Error View ───────────────────────────────────────────────

function ErrorView({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <QriooLogo className="mb-10" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-28 h-28 rounded-full flex items-center justify-center bg-red-50 shadow-lg">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </motion.div>

        <h1 className="text-xl font-black text-gray-900 mb-2">
          {message || 'Erreur de connexion'}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Une erreur est survenue. Veuillez r\u00e9essayer ult\u00e9rieurement.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Form View ────────────────────────────────────────────────

function FormView({
  data,
  isLoading,
  onSubmit,
}: {
  data: ActivateData;
  isLoading: boolean;
  onSubmit: (formData: Record<string, unknown>) => void;
}) {
  const packInfo = PACK_LABELS[data.packType];

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg px-4 pt-6 pb-2"
      >
        <QriooLogo className="mb-6" />

        {/* Pack type badge */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
            style={{ backgroundColor: QRIOO_PURPLE }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Activation du tag
            </h1>
            <p className="text-sm text-gray-500">{packInfo.label}</p>
          </div>
        </div>

        {/* Reference pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold"
          style={{ backgroundColor: '#F3F0FF', color: QRIOO_PURPLE }}
        >
          <QrCode className="w-3.5 h-3.5" />
          {data.reference}
        </div>

        {/* Agency info if present */}
        {data.agency && (
          <p className="mt-3 text-xs text-gray-400">
            Fourni par{' '}
            <span className="font-semibold text-gray-500">{data.agency.name}</span>
          </p>
        )}
      </motion.header>

      {/* Description card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-lg px-4 mt-4 mb-6"
      >
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: '#FAFAFE',
            borderColor: '#EDE9FE',
          }}
        >
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="text-xl mr-1.5">{packInfo.emoji}</span>
            {packInfo.description}
          </p>
        </div>
      </motion.div>

      {/* Form area */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="w-full max-w-lg px-4 flex-1"
      >
        <AnimatePresence mode="wait">
          {data.packType === 'pratique' && (
            <ActivatePratique
              key="pratique"
              onSubmit={(d: PratiqueFormData) => onSubmit(d as unknown as Record<string, unknown>)}
              isLoading={isLoading}
            />
          )}
          {data.packType === 'emotion' && (
            <ActivateEmotion
              key="emotion"
              onSubmit={(d: EmotionFormData) => onSubmit(d as unknown as Record<string, unknown>)}
              isLoading={isLoading}
            />
          )}
          {data.packType === 'evenementiel' && (
            <ActivateEvenementiel
              key="evenementiel"
              onSubmit={(d: EvenementielFormData) => onSubmit(d as unknown as Record<string, unknown>)}
              isLoading={isLoading}
            />
          )}
          {data.packType === 'immobilier' && (
            <ActivateImmobilier
              key="immobilier"
              onSubmit={(d: ImmobilierFormData) => onSubmit(d as unknown as Record<string, unknown>)}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>
      </motion.main>

      <QriooFooter />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function ActivatePage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;

  const [view, setView] = useState<ViewState>('loading');
  const [data, setData] = useState<ActivateData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  // ─── Fetch activation status ──────────────────────────────

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/activate/${reference}`);

        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setView('not_found');
            }
            return;
          }
          if (!cancelled) {
            setView('error');
            setErrorMessage('Erreur serveur');
          }
          return;
        }

        const json = await res.json();
        if (cancelled) return;

        if (json.alreadyActive) {
          router.replace(`/scan/${reference}`);
          return;
        }

        if (!json.canActivate) {
          // Tag is blocked, expired, or in a non-activatable status
          setView('blocked');
          return;
        }

        setData({
          reference: json.reference,
          packType: json.packType || 'pratique',
          status: json.status,
          canActivate: json.canActivate,
          alreadyActive: json.alreadyActive,
          agency: json.agency,
        });
        setView('form');
      } catch {
        if (!cancelled) {
          setView('error');
          setErrorMessage('Erreur de connexion');
        }
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [reference, router]);

  // ─── Handle form submission ───────────────────────────────

  const handleSubmit = useCallback(
    async (formData: Record<string, unknown>) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setErrorMessage(undefined);

      try {
        // Map Immobilier propertyType from display label to API enum value
        if (data?.packType === 'immobilier' && formData.propertyType) {
          const typeMap: Record<string, string> = {
            Appartement: 'appartement',
            Maison: 'maison',
            Terrain: 'terrain',
            Commercial: 'commercial',
            Autre: 'autre',
          };
          formData = {
            ...formData,
            propertyType: typeMap[formData.propertyType as string] || formData.propertyType,
          };
        }

        const res = await fetch(`/api/activate/${reference}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          if (errBody.code === 'ALREADY_ACTIVE') {
            router.replace(`/scan/${reference}`);
            return;
          }
          if (errBody.code === 'VALIDATION_ERROR' && errBody.details) {
            setErrorMessage('Veuillez corriger les erreurs dans le formulaire.');
            setIsSubmitting(false);
            return;
          }
          setErrorMessage(errBody.error || "Erreur lors de l'activation");
          setIsSubmitting(false);
          return;
        }

        // Success
        setView('activating');
      } catch {
        setErrorMessage('Erreur de connexion');
        setIsSubmitting(false);
      }
    },
    [reference, data, isSubmitting, router],
  );

  // ─── Render ───────────────────────────────────────────────

  if (view === 'loading') return <LoadingScreen />;
  if (view === 'not_found') return <NotFoundView />;
  if (view === 'blocked') return <BlockedView />;
  if (view === 'activating') return <SuccessView reference={reference} />;
  if (view === 'error') return <ErrorView message={errorMessage} />;
  if (view === 'form' && data) {
    return (
      <FormView
        data={data}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
      />
    );
  }

  return <LoadingScreen />;
}
