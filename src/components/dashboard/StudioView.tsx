'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Heart,
  Calendar,
  Building2,
  ArrowLeft,
  ArrowRight,
  Download,
  Copy,
  FileText,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

/* ------------------------------------------------------------------ */
/*  Pack definitions                                                  */
/* ------------------------------------------------------------------ */

type PackType = 'pratique' | 'emotion' | 'evenementiel' | 'immobilier';

interface PackDefinition {
  key: PackType;
  label: string;
  description: string;
  icon: typeof Package;
  color: string;
  gradient: string;
}

const PACKS: PackDefinition[] = [
  {
    key: 'pratique',
    label: 'Pratique',
    description: 'Objets perdus, étiquettes utilitaires',
    icon: Package,
    color: '#D97706',
    gradient: 'linear-gradient(135deg,#F59E0B,#D97706)',
  },
  {
    key: 'emotion',
    label: 'Emotion',
    description: 'Messages personnalisés, moments uniques',
    icon: Heart,
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg,#A855F7,#7C3AED)',
  },
  {
    key: 'evenementiel',
    label: 'Événementiel',
    description: 'Événements, billetterie, accueils',
    icon: Calendar,
    color: '#059669',
    gradient: 'linear-gradient(135deg,#10B981,#059669)',
  },
  {
    key: 'immobilier',
    label: 'Immobilier',
    description: 'Panneaux, visites virtuelles, biens',
    icon: Building2,
    color: '#475569',
    gradient: 'linear-gradient(135deg,#64748B,#475569)',
  },
];

const QUANTITIES = [4, 8, 16, 32] as const;

const STEP_LABELS = ['Choisir le pack', 'Configurer', 'Résultat'] as const;

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const cardHover = {
  y: -6,
  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface BatchResult {
  id: string;
  references: string[];
}

export default function StudioView() {
  const token = useAuthStore((s) => s.token);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedPack, setSelectedPack] = useState<PackType | null>(null);
  const [batchName, setBatchName] = useState('');
  const [quantity, setQuantity] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchResult | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const packDef = PACKS.find((p) => p.key === selectedPack) ?? null;

  /* ---- navigation helpers ---- */

  const goNext = useCallback(() => {
    if (step === 0 && !selectedPack) return;
    if (step === 1) {
      generateBatch();
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, 2));
  }, [step, selectedPack]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
    if (step === 2) {
      setBatch(null);
      setError(null);
    }
  }, [step]);

  /* ---- generate batch ---- */

  const generateBatch = useCallback(async () => {
    if (!token || !selectedPack) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: batchName || `Batch ${selectedPack}`,
          packType: selectedPack,
          quantity,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.batch) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setBatch({ id: data.batch.id, references: data.batch.references as string[] });
      setDirection(1);
      setStep(2);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, selectedPack, batchName, quantity]);

  /* ---- clipboard ---- */

  const copyReference = useCallback(async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedRef(ref);
      setTimeout(() => setCopiedRef(null), 1500);
    } catch {
      /* clipboard may be unavailable */
    }
  }, []);

  /* ---- download single QR ---- */

  const downloadQR = useCallback((ref: string) => {
    const link = document.createElement('a');
    link.href = `/api/qr/${ref}?size=200`;
    link.download = `${ref}.png`;
    link.click();
  }, []);

  /* ---- export CSV ---- */

  const exportCSV = useCallback(() => {
    if (!batch) return;
    const rows = ['Référence,Statut'];
    for (const ref of batch.references) {
      rows.push(`${ref},En stock`);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${batchName || 'batch'}_${batch.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [batch, batchName]);

  /* ---- export PDF (batch zip or single page) ---- */

  const exportPDF = useCallback(() => {
    if (!batch) return;
    /* Open a print-friendly view with all QR codes */
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cards = batch.references
      .map(
        (ref) => `
        <div style="text-align:center;width:140px;margin:8px auto;page-break-inside:avoid;">
          <div style="height:4px;background:${packDef?.color ?? '#7C3AED'};border-radius:4px 4px 0 0;"></div>
          <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:10px;">
            <img src="/api/qr/${ref}?size=200" width="120" height="120" style="image-rendering:pixelated;"/>
            <p style="font-family:monospace;font-size:11px;margin:6px 0 2px;color:#334155;">${ref}</p>
            <span style="font-size:10px;background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:999px;">En stock</span>
          </div>
        </div>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Qrioo - ${batchName || 'Batch'}</title>
      <style>body{font-family:sans-serif;margin:20px;display:flex;flex-wrap:wrap;justify-content:center;gap:0;}
      @media print{body{margin:0;}}</style></head>
      <body>${cards}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [batch, batchName, packDef]);

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ---- Header ---- */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h1 className="text-lg font-semibold text-slate-900">Studio de Création</h1>
      </div>

      {/* ---- Step Indicator ---- */}
      <div className="flex items-center justify-center gap-2 border-b border-slate-100 bg-slate-50 px-6 py-4">
        {STEP_LABELS.map((label, idx) => {
          const isActive = step === idx;
          const isDone = step > idx;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                      : isDone
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-purple-700' : 'text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  className={`mx-2 h-0.5 w-8 rounded transition-colors duration-300 ${
                    step > idx ? 'bg-purple-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Content ---- */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ============ STEP 0: Choose Pack ============ */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="mb-1 text-2xl font-bold text-slate-900">
                Choisissez votre pack
              </h2>
              <p className="mb-8 text-slate-500">
                Sélectionnez le type de QR codes que vous souhaitez créer.
              </p>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {PACKS.map((pack) => {
                  const Icon = pack.icon;
                  const isSelected = selectedPack === pack.key;
                  return (
                    <motion.button
                      key={pack.key}
                      type="button"
                      onClick={() => setSelectedPack(pack.key)}
                      whileHover={cardHover}
                      whileTap={{ scale: 0.97 }}
                      className={`group relative flex flex-col items-start overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-100'
                          : 'ring-1 ring-slate-200 hover:ring-slate-300'
                      }`}
                    >
                      {/* gradient background */}
                      <div
                        className="absolute inset-0 opacity-90"
                        style={{ background: pack.gradient }}
                      />
                      {/* overlay for text contrast */}
                      <div className="absolute inset-0 bg-black/10" />

                      {/* selected glow */}
                      {isSelected && (
                        <motion.div
                          layoutId="packGlow"
                          className="absolute -inset-0.5 rounded-2xl bg-purple-400/20 blur-md"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}

                      <div className="relative z-10 flex flex-col items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {pack.label}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-white/80">
                            {pack.description}
                          </p>
                        </div>

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white"
                          >
                            <Check className="h-4 w-4 text-purple-600" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============ STEP 1: Configure ============ */}
          {step === 1 && packDef && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <h2 className="mb-1 text-2xl font-bold text-slate-900">
                Configurez votre lot
              </h2>
              <p className="mb-8 text-slate-500">
                Personnalisez le nom et la quantité de QR codes à générer.
              </p>

              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 lg:grid-cols-5">
                {/* ---- Form Column ---- */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Batch name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nom du lot
                    </label>
                    <input
                      type="text"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="Ex: Étiquettes bureau"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* Quantity selector */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Quantité
                    </label>
                    <div className="flex gap-3">
                      {QUANTITIES.map((q) => {
                        const isActive = quantity === q;
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantity(q)}
                            className={`flex h-12 w-16 items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 ${
                              isActive
                                ? 'text-white shadow-md'
                                : 'border border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                            }`}
                            style={
                              isActive
                                ? { background: packDef.gradient }
                                : undefined
                            }
                          >
                            {q}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* ---- Summary Column ---- */}
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                      Résumé
                    </h3>

                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ background: packDef.gradient }}
                      >
                        <packDef.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {packDef.label}
                        </p>
                        <p className="text-xs text-slate-500">Pack sélectionné</p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Nom du lot</span>
                        <span className="font-medium text-slate-900">
                          {batchName || '—'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Quantité</span>
                        <span className="font-bold" style={{ color: packDef.color }}>
                          {quantity} QR codes
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Format</span>
                        <span className="font-medium text-slate-900">PNG 200px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ STEP 2: Results ============ */}
          {step === 2 && batch && packDef && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {batchName || batch.id}
                  </h2>
                  <p className="text-slate-500">
                    {batch.references.length} QR codes générés avec le pack{' '}
                    <span className="font-semibold" style={{ color: packDef.color }}>
                      {packDef.label}
                    </span>
                  </p>
                </div>

                {/* Export buttons */}
                <div className="mt-3 flex gap-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportPDF}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4" />
                    PDF
                  </button>
                </div>
              </div>

              {/* QR Code Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {batch.references.map((ref, idx) => {
                  const isCopied = copiedRef === ref;
                  return (
                    <motion.div
                      key={ref}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Colored top bar */}
                      <div
                        className="h-1.5 w-full"
                        style={{ background: packDef.gradient }}
                      />

                      {/* QR Image */}
                      <div className="flex items-center justify-center p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/qr/${ref}?size=200`}
                          alt={`QR ${ref}`}
                          width={128}
                          height={128}
                          className="rounded-lg"
                          loading="lazy"
                        />
                      </div>

                      {/* Reference + status */}
                      <div className="border-t border-slate-100 px-3 py-2.5">
                        <p className="truncate font-mono text-xs text-slate-700">
                          {ref}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          En stock
                        </span>
                      </div>

                      {/* Hover actions overlay */}
                      <div className="absolute inset-x-0 bottom-0 flex gap-1 border-t border-slate-100 bg-white/95 px-3 py-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => copyReference(ref)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                          title="Copier la référence"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {isCopied ? 'Copié' : 'Copier'}
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadQR(ref)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-white transition"
                          style={{ background: packDef.gradient }}
                          title="Télécharger le QR code"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PNG
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Footer Navigation ---- */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition ${
            step === 0
              ? 'cursor-not-allowed text-slate-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={
            (step === 0 && !selectedPack) || loading || (step === 2 && !batch)
          }
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition ${
            step === 0 && !selectedPack
              ? 'cursor-not-allowed bg-slate-300'
              : loading
                ? 'cursor-wait bg-purple-400'
                : step === 2
                  ? 'cursor-default bg-slate-300'
                  : 'bg-purple-600 shadow-md shadow-purple-200 hover:bg-purple-700'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération…
            </>
          ) : step === 2 ? (
            'Terminé'
          ) : (
            <>
              {step === 0 ? 'Continuer' : 'Générer'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
