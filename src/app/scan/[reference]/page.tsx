'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Loader2, AlertCircle, ShieldOff, Clock, ArrowRight } from 'lucide-react';
import PackPratique from '@/components/scan/PackPratique';
import PackEmotion from '@/components/scan/PackEmotion';
import PackEvenementiel from '@/components/scan/PackEvenementiel';
import PackImmobilier from '@/components/scan/PackImmobilier';

const QRIOO_PURPLE = '#7C3AED';

type ScanStatus =
  | 'not_found'
  | 'blocked'
  | 'pending_activation'
  | 'expired'
  | 'active'
  | 'lost'
  | 'error';

type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

interface ScanResponse {
  status: ScanStatus;
  message?: string;
  packType?: PackType;
  baggage?: Record<string, unknown>;
  guestMessages?: Array<{
    id: string;
    authorName: string;
    content: string;
    contentUrl: string | null;
    contentType: string | null;
    createdAt: string;
  }>;
}

// ─── Shared Logo ──────────────────────────────────────────────
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

// ─── Shared Footer ─────────────────────────────────────────────
function QriooFooter() {
  return (
    <div className="mt-auto pt-8 pb-6">
      <p className="text-gray-400 text-xs">
        Propulse par{' '}
        <span className="font-bold text-gray-600">Qrioo</span>
      </p>
    </div>
  );
}

// ─── Loading Spinner ────────────────────────────────────────────
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
            Analyse du QR code en cours...
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Not Found ──────────────────────────────────────────────────
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
            <QrCode className="w-12 h-12" style={{ color: QRIOO_PURPLE, opacity: 0.4 }} />
          </div>
        </motion.div>

        <h1 className="text-5xl font-black mb-3" style={{ color: QRIOO_PURPLE }}>
          404
        </h1>
        <p className="text-lg font-bold text-gray-800 mb-2">
          Code QR non valide
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ce QR code ne correspond a aucun tag Qrioo. Verifiez le code et reessayez.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Blocked View ───────────────────────────────────────────────
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

        <h1 className="text-2xl font-black text-gray-900 mb-2">Tag bloque</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ce tag Qrioo a ete desactive par son proprietaire ou par un administrateur.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Expired View ───────────────────────────────────────────────
function ExpiredView({ packType }: { packType?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-amber-50 to-white">
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
          <div className="w-28 h-28 rounded-full flex items-center justify-center bg-amber-50 shadow-lg border-2 border-amber-200">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
        </motion.div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Tag expire
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ce tag Qrioo a expire et n&apos;est plus actif. Contactez{' '}
          {packType === 'immobilier'
            ? "l'agence"
            : "l'agence de voyage"}{' '}
          pour plus d&apos;informations.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Pending Activation View ────────────────────────────────────
function PendingActivationView({ reference }: { reference: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center max-w-sm w-full"
      >
        <QriooLogo className="mb-10" />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl"
            style={{ backgroundColor: '#F3F0FF' }}
          >
            <QrCode
              className="w-12 h-12"
              style={{ color: QRIOO_PURPLE, opacity: 0.6 }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle
              className="w-5 h-5"
              style={{ color: QRIOO_PURPLE }}
            />
            <h2 className="text-lg font-bold text-gray-900">
              Tag pas encore active
            </h2>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Ce tag Qrioo a ete cree mais n&apos;a pas encore ete active par
            son proprietaire. Il sera fonctionnel des que l&apos;activation
            sera terminee.
          </p>

          <div
            className="w-full py-2.5 px-4 rounded-xl text-center mb-6"
            style={{ backgroundColor: '#F3F0FF' }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Reference
            </p>
            <p
              className="text-sm font-mono font-bold mt-0.5"
              style={{ color: QRIOO_PURPLE }}
            >
              {reference}
            </p>
          </div>

          <a
            href={`/activate/${reference}`}
            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] min-h-[48px]"
            style={{ backgroundColor: QRIOO_PURPLE }}
          >
            Activer ce tag
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Error View ─────────────────────────────────────────────────
function ErrorView() {
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
          Erreur de connexion
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Une erreur est survenue lors du chargement de ce tag. Veuillez
          reessayer ulterieurement.
        </p>
      </motion.div>

      <QriooFooter />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
export default function ScanPage() {
  const params = useParams();
  const reference = params.reference as string;

  const [data, setData] = useState<ScanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    async function fetchScan() {
      try {
        const res = await fetch(`/api/scan/${reference}`);
        if (!res.ok) {
          if (!cancelled) {
            setData({ status: 'error', message: 'Erreur serveur' });
            setLoading(false);
          }
          return;
        }
        const json = (await res.json()) as ScanResponse;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setData({ status: 'error', message: 'Erreur reseau' });
          setLoading(false);
        }
      }
    }

    fetchScan();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (loading) return <LoadingScreen />;
  if (!data) return <ErrorView />;

  // ─── Error / server issues ───
  if (data.status === 'error') return <ErrorView />;

  // ─── Not found ───
  if (data.status === 'not_found') return <NotFoundView />;

  // ─── Blocked ───
  if (data.status === 'blocked') return <BlockedView />;

  // ─── Expired ───
  if (data.status === 'expired') {
    return <ExpiredView packType={data.packType} />;
  }

  // ─── Pending activation ───
  if (data.status === 'pending_activation') {
    return <PendingActivationView reference={reference} />;
  }

  // ─── Active / Lost — render pack component ───
  if (data.status === 'active' || data.status === 'lost') {
    const packType = data.packType || 'pratique';
    const baggage = data.baggage || {};

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={packType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {packType === 'pratique' && (
            <PackPratique
              reference={reference}
              baggage={
                baggage as {
                  reference: string;
                  type: string;
                  travelerName: string;
                  travelerFirstName?: string | null;
                  status: string;
                  agency?: string | null;
                  whatsappOwner?: string | null;
                  isLost?: boolean;
                  objectInfo?: Record<string, unknown> | null;
                }
              }
            />
          )}

          {packType === 'emotion' && (
            <PackEmotion
              reference={reference}
              contentType={(baggage.contentType as string) || null}
              contentUrl={(baggage.contentUrl as string) || null}
              contentMetadata={
                (baggage.contentMetadata as Record<string, unknown>) ||
                null
              }
              travelerName={(baggage.travelerName as string) || null}
            />
          )}

          {packType === 'evenementiel' && (
            <PackEvenementiel
              reference={reference}
              contentMetadata={
                (baggage.contentMetadata as Record<string, unknown>) ||
                null
              }
              travelerName={(baggage.travelerName as string) || null}
              initialMessages={data.guestMessages || []}
            />
          )}

          {packType === 'immobilier' && (
            <PackImmobilier
              reference={reference}
              contentMetadata={
                (baggage.contentMetadata as Record<string, unknown>) ||
                null
              }
              travelerName={(baggage.travelerName as string) || null}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ─── Fallback ───
  return <NotFoundView />;
}
