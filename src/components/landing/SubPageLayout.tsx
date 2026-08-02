'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { QrCode, ArrowLeft, Globe } from 'lucide-react';

/* ================================================================== */
/*  ANIMATIONS                                                         */
/* ================================================================== */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ================================================================== */
/*  PROPS                                                              */
/* ================================================================== */

interface SubPageLayoutProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children: ReactNode;
  onBack: () => void;
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function SubPageLayout({
  title,
  subtitle,
  badge,
  badgeColor = '#7C3AED',
  children,
  onBack,
}: SubPageLayoutProps) {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true, margin: '-40px' });

  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      {/* ============================================================= */}
      {/*  NAVBAR                                                        */}
      {/* ============================================================= */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: 'rgba(255,255,255,0.82)',
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #C084FC 25%, #F59E0B 50%, #10B981 75%, transparent 100%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200"
                style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
              >
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Qrioo
              </span>
            </div>
          </div>
          <button
            onClick={() => {}}
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
      <section className="relative pt-32 sm:pt-36 pb-12 sm:pb-16">
        {/* Background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
            style={{
              background: `radial-gradient(circle, ${badgeColor}, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full opacity-10 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #A855F7, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #7C3AED 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={stagger}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          {badge && (
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-semibold mb-6"
              style={{
                borderColor: `${badgeColor}33`,
                color: badgeColor,
                backgroundColor: `${badgeColor}11`,
              }}
            >
              {badge}
            </motion.div>
          )}

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </section>

      {/* ============================================================= */}
      {/*  CONTENT                                                       */}
      {/* ============================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>

      {/* ============================================================= */}
      {/*  FOOTER                                                        */}
      {/* ============================================================= */}
      <footer className="border-t border-gray-100 mt-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
                >
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-gray-900">Qrioo</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Plateforme SaaS de QR codes dynamiques. Créez, gérez et suivez
                vos QR codes en toute simplicité.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Produit</h4>
              <ul className="space-y-2.5">
                {['Fonctionnalités', 'Packs', 'Tarifs', 'API'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-purple-600 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Entreprise</h4>
              <ul className="space-y-2.5">
                {['À propos', 'Blog', 'Carrières', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-purple-600 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-4">Légal</h4>
              <ul className="space-y-2.5">
                {['Confidentialité', 'CGU', 'Mentions légales'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-purple-600 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Qrioo. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs text-gray-400">Fait avec passion en Afrique</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
