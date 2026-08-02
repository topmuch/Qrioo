'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  QrCode,
  LayoutDashboard,
  BarChart3,
  FileText,
  Building2,
  Bell,
  Shield,
  Globe,
  Check,
  MapPin,
  Mail,
  Phone,
  Clock,
  Send,
  Sparkles,
  Lightbulb,
  Lock,
  Briefcase,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import SubPageLayout from '@/components/landing/SubPageLayout';

/* ================================================================== */
/*  CONSTANTS                                                          */
/* ================================================================== */

const COLORS = {
  purple: '#7C3AED',
  amber: '#F59E0B',
  emerald: '#10B981',
  slate: '#64748B',
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ================================================================== */
/*  ANIMATED SECTION WRAPPER                                          */
/* ================================================================== */

function AnimatedSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FadeUpItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className={className}>
      {children}
    </motion.div>
  );
}

/* ================================================================== */
/*  1. FONCTIONNALITÉS                                                 */
/* ================================================================== */

const FEATURES = [
  {
    icon: QrCode,
    title: 'Création en masse',
    desc: 'Générez des dizaines de QR codes en un seul clic',
    color: COLORS.purple,
  },
  {
    icon: LayoutDashboard,
    title: 'Tableau de bord',
    desc: 'Visualisez vos statistiques en temps réel',
    color: COLORS.amber,
  },
  {
    icon: BarChart3,
    title: 'Suivi des scans',
    desc: 'Chaque scan est enregistré avec localisation',
    color: COLORS.emerald,
  },
  {
    icon: FileText,
    title: 'Export PDF & CSV',
    desc: 'Téléchargez vos QR codes en formats imprimables',
    color: COLORS.slate,
  },
  {
    icon: Building2,
    title: 'Multi-agences',
    desc: 'Gérez plusieurs agences depuis un compte unique',
    color: COLORS.purple,
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Recevez des alertes à chaque scan',
    color: COLORS.amber,
  },
  {
    icon: Shield,
    title: 'Sécurité avancée',
    desc: 'Authentification JWT et rôles permissions',
    color: COLORS.emerald,
  },
  {
    icon: Globe,
    title: 'API intégrée',
    desc: 'Connectez Qrioo à vos outils existants',
    color: COLORS.slate,
  },
];

function FonctionnalitesPage() {
  return (
    <section className="py-24">
      <AnimatedSection className="grid sm:grid-cols-2 gap-6">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <FadeUpItem key={f.title}>
              <div className="group rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${f.color}22, ${f.color}11)`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            </FadeUpItem>
          );
        })}
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  2. TARIFS                                                          */
/* ================================================================== */

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    priceSub: '',
    highlighted: false,
    popular: false,
    features: [
      '50 QR codes/mois',
      '1 agence',
      'Export PDF',
      'Support email',
    ],
    cta: 'Gratuit',
    color: COLORS.slate,
  },
  {
    name: 'Pro',
    price: '29€/mois',
    priceSub: '',
    highlighted: true,
    popular: true,
    features: [
      '500 QR codes/mois',
      '5 agences',
      'Export PDF + CSV',
      'Accès API',
      'Support prioritaire',
    ],
    cta: '29€/mois',
    color: COLORS.purple,
  },
  {
    name: 'Entreprise',
    price: 'Sur mesure',
    priceSub: '',
    highlighted: false,
    popular: false,
    features: [
      'QR codes illimités',
      'Agences illimitées',
      'Tout inclus',
      'API dédiée',
      'Support dédié',
      'SLA garanti',
    ],
    cta: 'Nous contacter',
    color: COLORS.emerald,
  },
];

function TarifsPage() {
  return (
    <section className="py-24">
      <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <FadeUpItem key={plan.name}>
            <div
              className={`relative rounded-2xl border-2 p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'border-purple-500 shadow-xl shadow-purple-100'
                  : 'border-gray-100 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.amber})` }}
                >
                  Populaire
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-3xl font-black mb-1" style={{ color: plan.color }}>
                {plan.price}
              </p>
              <p className="text-sm text-gray-400 mb-8">{plan.priceSub}</p>
              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <Check
                      className="w-5 h-5 mt-0.5 shrink-0"
                      style={{ color: plan.color }}
                    />
                    <span className="text-gray-600 text-sm">{feat}</span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
                style={{
                  background: plan.highlighted
                    ? `linear-gradient(135deg, ${COLORS.purple}, #A855F7)`
                    : 'white',
                  color: plan.highlighted ? 'white' : plan.color,
                  border: plan.highlighted
                    ? 'none'
                    : `2px solid ${plan.color}33`,
                }}
              >
                {plan.cta}
              </button>
            </div>
          </FadeUpItem>
        ))}
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  3. API                                                             */
/* ================================================================== */

const CODE_EXAMPLES = [
  {
    method: 'POST',
    endpoint: '/api/batches',
    title: 'Créer un lot de QR codes',
    code: `{
  "agencyId": "clx123abc",
  "packType": "pratique",
  "quantity": 50,
  "label": "Bagages Dakar - Jan 2025"
}`,
  },
  {
    method: 'GET',
    endpoint: '/api/qrcodes',
    title: 'Lister les QR codes',
    code: `GET /api/qrcodes?
  agencyId=clx123abc
  &status=active
  &page=1
  &limit=20`,
  },
  {
    method: 'POST',
    endpoint: '/api/scan/:ref',
    title: 'Enregistrer un scan',
    code: `{
  "reference": "QR-AB12CD34",
  "location": "Dakar, Sénégal",
  "context": "lost"
}`,
  },
];

const API_FEATURES = [
  'RESTful',
  'Réponses JSON',
  'Authentification Bearer',
  'Rate limiting',
  'Webhooks (bientôt)',
];

function ApiPage() {
  return (
    <section className="py-24 space-y-20">
      <AnimatedSection className="space-y-6">
        {CODE_EXAMPLES.map((ex) => (
          <FadeUpItem key={ex.endpoint}>
            <div className="rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-bold text-white"
                  style={{
                    background:
                      ex.method === 'GET' ? COLORS.emerald : COLORS.purple,
                  }}
                >
                  {ex.method}
                </span>
                <code className="text-sm font-mono text-gray-700">
                  {ex.endpoint}
                </code>
              </div>
              <div className="bg-gray-900 text-gray-100 p-5 rounded-b-2xl">
                <p className="text-xs text-gray-400 mb-3 font-medium">
                  {ex.title}
                </p>
                <pre className="font-mono text-sm leading-relaxed whitespace-pre overflow-x-auto">
                  {ex.code}
                </pre>
              </div>
            </div>
          </FadeUpItem>
        ))}
      </AnimatedSection>

      <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {API_FEATURES.map((feat) => (
          <FadeUpItem key={feat}>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 bg-white hover:shadow-md transition-shadow">
              <Check className="w-5 h-5 shrink-0" style={{ color: COLORS.purple }} />
              <span className="text-sm font-medium text-gray-700">{feat}</span>
            </div>
          </FadeUpItem>
        ))}
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  4. À PROPOS                                                       */
/* ================================================================== */

const TEAM = [
  { initials: 'AD', name: 'Amadou Diallo', role: 'CEO & Fondateur', color: COLORS.purple },
  { initials: 'FS', name: 'Fatou Sow', role: 'CTO', color: COLORS.amber },
  { initials: 'IF', name: 'Ibrahima Fall', role: 'Head of Design', color: COLORS.emerald },
  { initials: 'AB', name: 'Aïssatou Ba', role: 'Head of Growth', color: COLORS.slate },
];

const VALUES = [
  {
    icon: Sparkles,
    title: 'Innovation',
    desc: 'Nous repoussons les limites de la technologie pour créer des solutions qui anticipent les besoins de demain.',
    color: COLORS.purple,
  },
  {
    icon: Lightbulb,
    title: 'Simplicité',
    desc: 'La puissance ne doit jamais se faire au détriment de la facilité. Nos outils sont conçus pour tous.',
    color: COLORS.amber,
  },
  {
    icon: Lock,
    title: 'Sécurité',
    desc: 'La confiance de nos utilisateurs est notre priorité. Données chiffrées, accès contrôlés, transparence totale.',
    color: COLORS.emerald,
  },
];

function AproposPage() {
  return (
    <section className="py-24 space-y-24">
      <AnimatedSection>
        <FadeUpItem>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Notre mission
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg">
              Démocratiser l&rsquo;utilisation des QR codes dynamiques en Afrique.
              Chez Qrioo, nous croyons que chaque entreprise, quelle que soit sa taille,
              mérite un accès à des outils technologiques performants et abordables.
              Notre plateforme permet aux agences de voyage, aux entreprises immobilières
              et aux organisateurs d&rsquo;événements de transformer leurs interactions
              avec leurs clients grâce à des QR codes intelligents et traçables.
            </p>
          </div>
        </FadeUpItem>
      </AnimatedSection>

      <AnimatedSection className="grid sm:grid-cols-3 gap-6">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <FadeUpItem key={v.title}>
              <div className="rounded-2xl border border-gray-100 p-6 sm:p-8 bg-white hover:shadow-lg transition-all duration-300 text-center">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: `linear-gradient(135deg, ${v.color}22, ${v.color}11)`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: v.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </FadeUpItem>
          );
        })}
      </AnimatedSection>

      <AnimatedSection>
        <FadeUpItem>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10 text-center">
            L&rsquo;équipe
          </h2>
        </FadeUpItem>
      </AnimatedSection>
      <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEAM.map((member) => (
          <FadeUpItem key={member.name}>
            <div className="rounded-2xl border border-gray-100 p-6 bg-white hover:shadow-lg transition-all duration-300 text-center group">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${member.color}, ${member.color}CC)`,
                }}
              >
                {member.initials}
              </div>
              <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{member.role}</p>
            </div>
          </FadeUpItem>
        ))}
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  5. BLOG                                                            */
/* ================================================================== */

const BLOG_POSTS = [
  {
    title: 'Comment les QR codes révolutionnent le voyage',
    date: '15 Jan 2025',
    readTime: '5 min',
    category: 'Voyage',
    color: COLORS.purple,
    icon: Globe,
  },
  {
    title: '5 astuces pour vos événements',
    date: '8 Jan 2025',
    readTime: '3 min',
    category: 'Événements',
    color: COLORS.amber,
    icon: Sparkles,
  },
  {
    title: 'Immobilier : le guide complet des QR codes',
    date: '2 Jan 2025',
    readTime: '7 min',
    category: 'Immobilier',
    color: COLORS.emerald,
    icon: Building2,
  },
  {
    title: 'Sécurité et QR codes : ce que vous devez savoir',
    date: '28 Déc 2024',
    readTime: '4 min',
    category: 'Sécurité',
    color: COLORS.purple,
    icon: Shield,
  },
  {
    title: 'Témoignage : Voyages Sérénité',
    date: '20 Déc 2024',
    readTime: '6 min',
    category: 'Témoignage',
    color: COLORS.amber,
    icon: BookOpen,
  },
  {
    title: 'Qrioo 2.0 : les nouveautés',
    date: '15 Déc 2024',
    readTime: '4 min',
    category: 'Produit',
    color: COLORS.emerald,
    icon: Sparkles,
  },
];

function BlogPage() {
  return (
    <section className="py-24">
      <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => {
          const Icon = post.icon;
          return (
            <FadeUpItem key={post.title}>
              <button
                onClick={() => alert('Article bientôt disponible')}
                className="w-full text-left rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div
                  className="h-44 flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${post.color}18, ${post.color}08)`,
                  }}
                >
                  <Icon
                    className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: `${post.color}44` }}
                  />
                </div>
                <div className="p-6">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                    style={{
                      color: post.color,
                      backgroundColor: `${post.color}11`,
                    }}
                  >
                    {post.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug group-hover:text-purple-700 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} de lecture</span>
                  </div>
                </div>
              </button>
            </FadeUpItem>
          );
        })}
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  6. CARRIÈRES                                                       */
/* ================================================================== */

const JOBS = [
  {
    title: 'Développeur Full Stack',
    location: 'Dakar',
    contract: 'CDI',
    tags: ['React', 'Next.js', 'TypeScript'],
    desc: 'Rejoignez notre équipe technique pour construire la plateforme Qrioo de demain. Vous travaillerez sur le frontend et le backend de notre produit SaaS.',
  },
  {
    title: 'Designer UX/UI',
    location: 'Remote',
    contract: 'CDI',
    tags: ['Figma', 'Tailwind CSS'],
    desc: 'Créez des interfaces élégantes et intuitives qui rendent la gestion des QR codes accessible à tous. Vous définirez l\'identité visuelle de Qrioo.',
  },
  {
    title: 'Chargé de Clientèle',
    location: 'Dakar',
    contract: 'CDI',
    tags: ['SaaS', 'CRM'],
    desc: 'Accompagnez nos clients dans leur adoption de Qrioo. Vous serez le lien entre notre produit et les entreprises qui nous font confiance au quotidien.',
  },
  {
    title: 'Chef de Projet',
    location: 'Dakar',
    contract: 'CDI',
    tags: ['Agile', 'Gestion de projet'],
    desc: 'Pilotez le développement de nouvelles fonctionnalités en coordination avec les équipes technique, design et commerciale. Méthodologie agile exigée.',
  },
];

function CarrieresPage() {
  return (
    <section className="py-24 space-y-12">
      <AnimatedSection>
        <FadeUpItem>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-500 leading-relaxed text-lg">
              Construisez avec nous l&rsquo;avenir des QR codes en Afrique.
              Qrioo recrute des talents passionnés qui veulent donner un sens
              à leur travail. Rejoignez une équipe dynamique, bienveillante
              et résolument tournée vers l&rsquo;innovation.
            </p>
          </div>
        </FadeUpItem>
      </AnimatedSection>

      <AnimatedSection className="grid sm:grid-cols-2 gap-6">
        {JOBS.map((job) => (
          <FadeUpItem key={job.title}>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col h-full hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                <Briefcase className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    color: COLORS.purple,
                    backgroundColor: `${COLORS.purple}11`,
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    color: COLORS.emerald,
                    backgroundColor: `${COLORS.emerald}11`,
                  }}
                >
                  {job.contract}
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
                {job.desc}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-lg bg-gray-50 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => alert('Candidature bientôt disponible')}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] min-h-[48px] flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.purple}, #A855F7)`,
                }}
              >
                Postuler
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </FadeUpItem>
        ))}
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  7. CONTACT                                                         */
/* ================================================================== */

function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message envoyé avec succès ! Nous vous répondrons sous 24h.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@qrioo.com',
      color: COLORS.purple,
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+221 77 123 45 67',
      color: COLORS.amber,
    },
    {
      icon: MapPin,
      label: 'Adresse',
      value: 'Dakar, Sénégal',
      color: COLORS.emerald,
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun-Ven 9h-18h',
      color: COLORS.slate,
    },
  ];

  return (
    <section className="py-24">
      <AnimatedSection className="grid lg:grid-cols-5 gap-12">
        <FadeUpItem className="lg:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 text-sm min-h-[48px]"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 text-sm min-h-[48px]"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sujet
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 text-sm min-h-[48px]"
                placeholder="L'objet de votre message"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-purple-500 focus:outline-none transition-colors text-gray-900 text-sm resize-none"
                placeholder="Décrivez votre projet ou votre demande..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-200 hover:scale-[1.02] active:scale-[0.98] min-h-[48px] flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${COLORS.purple}, #A855F7)`,
              }}
            >
              <Send className="w-4 h-4" />
              Envoyer le message
            </button>
          </form>
        </FadeUpItem>

        <FadeUpItem className="lg:col-span-2">
          <div className="space-y-4">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${info.color}22, ${info.color}11)`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: info.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {info.label}
                    </p>
                    <p className="text-gray-900 font-medium text-sm">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeUpItem>
      </AnimatedSection>
    </section>
  );
}

/* ================================================================== */
/*  8-10. LEGAL PAGES                                                  */
/* ================================================================== */

interface LegalSection {
  title: string;
  content: string;
}

const CONFIDENTIALITE_SECTIONS: LegalSection[] = [
  {
    title: '1. Collecte des données',
    content:
      'Qrioo collecte les données personnelles que vous nous fournissez lors de la création de votre compte, notamment votre nom, adresse e-mail et informations professionnelles. Nous collectons également les données de navigation et d\'utilisation de la plateforme dans le but d\'améliorer nos services. Aucune donnée n\'est collectée à votre insu, et vous êtes informé(e) de chaque traitement effectué.',
  },
  {
    title: '2. Utilisation des données',
    content:
      'Vos données sont utilisées pour fournir et améliorer nos services de QR codes dynamiques, traiter vos demandes de support, vous envoyer des communications liées à votre compte et respecter nos obligations légales. Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins commerciales.',
  },
  {
    title: '3. Cookies et technologies similaires',
    content:
      'Notre site utilise des cookies essentiels au fonctionnement de la plateforme ainsi que des cookies analytiques pour comprendre comment nos utilisateurs interagissent avec nos services. Vous pouvez configurer votre navigateur pour refuser les cookies, bien que cela puisse affecter certaines fonctionnalités de Qrioo.',
  },
  {
    title: '4. Partage avec des tiers',
    content:
      'Qrioo peut partager vos données avec des prestataires de services techniques (hébergement, analyse) dans le strict cadre de la prestation. Ces prestataires sont soumis à des accords de confidentialité rigoureux. Vos données de QR codes ne sont jamais partagées sans votre consentement explicite.',
  },
  {
    title: '5. Conservation des données',
    content:
      'Vos données personnelles sont conservées pendant la durée de votre abonnement et jusqu\'à 3 ans après la résiliation pour des raisons légales et de support. Les données de scan anonymisées peuvent être conservées à des fins statistiques. Vous pouvez demander la suppression de vos données à tout moment.',
  },
  {
    title: '6. Vos droits',
    content:
      'Conformément à la loi n°2008-12 relative à la protection des données personnelles au Sénégal, vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à dpo@qrioo.com. Nous répondrons à toute demande dans un délai de 30 jours.',
  },
];

const CGU_SECTIONS: LegalSection[] = [
  {
    title: '1. Objet du service',
    content:
      'Qrioo est une plateforme SaaS permettant la création, la gestion et le suivi de QR codes dynamiques. Le service est accessible via internet et nécessite la création d\'un compte. Qrioo se réserve le droit de modifier, suspendre ou interrompre le service pour des raisons de maintenance ou d\'amélioration, avec un préavis raisonnable.',
  },
  {
    title: '2. Comptes utilisateurs',
    content:
      'Chaque utilisateur doit fournir des informations exactes et à jour lors de l\'inscription. Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité réalisée depuis votre compte est de votre responsabilité. En cas d\'utilisation non autorisée, vous devez nous en informer immédiatement.',
  },
  {
    title: '3. QR codes et contenus',
    content:
      'Les QR codes générés via Qrioo restent la propriété de l\'utilisateur. L\'utilisateur est seul responsable du contenu associé à ses QR codes et s\'engage à ne pas y inclure de contenu illégal, diffamatoire ou portant atteinte aux droits de tiers. Qrioo se réserve le droit de désactiver tout QR code contrevenant à ces règles.',
  },
  {
    title: '4. Responsabilité',
    content:
      'Qrioo fournit le service "en l\'état" sans garantie de disponibilité continue. Notre responsabilité est limitée aux dommages directs prouvés et ne saurait excéder le montant des frais payés au cours des 12 derniers mois. Qrioo ne saurait être tenu responsable des dommages indirects, perte de données ou perte de revenus.',
  },
  {
    title: '5. Modifications des CGU',
    content:
      'Qrioo se réserve le droit de modifier les présentes conditions générales à tout moment. Les utilisateurs seront notifiés par e-mail au moins 15 jours avant l\'entrée en vigueur des modifications. La poursuite de l\'utilisation du service après cette date vaut acceptation des nouvelles conditions.',
  },
  {
    title: '6. Droit applicable',
    content:
      'Les présentes conditions générales sont régies par le droit sénégalais. En cas de litige, les parties s\'engagent à rechercher une solution amiable. À défaut, le Tribunal de Grande Instance de Dakar sera seul compétent. La langue de référence est le français.',
  },
];

const MENTIONS_SECTIONS: LegalSection[] = [
  {
    title: 'Éditeur de la plateforme',
    content:
      'Qrioo est une marque détenue par la société Qrioo SAS, immatriculée au Registre du Commerce et du Crédit Mobilier de Dakar sous le numéro RCCM SN-DKR-2024-A-12345. Le siège social est situé à Dakar, Sénégal. N° d\'identification fiscale : NIF A1234567890B.',
  },
  {
    title: 'Hébergement',
    content:
      'La plateforme Qrioo est hébergée par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Les données sont stockées sur des serveurs sécurisés conformément aux standards internationaux de sécurité de l\'information (ISO 27001).',
  },
  {
    title: 'Directeur de la publication',
    content:
      'Le directeur de la publication est Monsieur Amadou Diallo, en sa qualité de Président-Directeur Général de Qrioo SAS. Pour toute question relative au contenu de la plateforme, il peut être contacté à l\'adresse direction@qrioo.com.',
  },
  {
    title: 'Propriété intellectuelle',
    content:
      'L\'ensemble des éléments composant la plateforme Qrioo (logos, textes, graphismes, code source, interfaces) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation ou diffusion, même partielle, sans autorisation préalable écrite est strictement interdite et constitue une contrefaçon.',
  },
  {
    title: 'Contact',
    content:
      'Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter par e-mail à legal@qrioo.com ou par courrier à l\'adresse suivante : Qrioo SAS, BP 12345, Dakar, Sénégal. Notre Délégué à la Protection des Données est joignable à dpo@qrioo.com.',
  },
];

function LegalPage({ sections }: { sections: LegalSection[] }) {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto space-y-10">
        {sections.map((section) => (
          <AnimatedSection key={section.title}>
            <FadeUpItem>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {section.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                {section.content}
              </p>
            </FadeUpItem>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  PAGE CONFIG                                                        */
/* ================================================================== */

interface PageConfig {
  badge: string;
  badgeColor: string;
  title: string;
  subtitle?: string;
  component: React.ComponentType;
}

const PAGE_MAP: Record<string, PageConfig> = {
  fonctionnalites: {
    badge: 'Fonctionnalités',
    badgeColor: COLORS.amber,
    title: 'Tout ce qu\'il vous faut pour gérer vos QR codes',
    component: FonctionnalitesPage,
  },
  tarifs: {
    badge: 'Tarifs',
    badgeColor: COLORS.emerald,
    title: 'Des prix simples et transparents',
    component: TarifsPage,
  },
  api: {
    badge: 'API',
    badgeColor: COLORS.purple,
    title: 'Intégrez Qrioo dans vos outils',
    subtitle:
      'Notre API RESTful vous permet d\'intégrer Qrioo dans vos systèmes existants. Créez des lots, listez vos QR codes et enregistrez les scans par programme.',
    component: ApiPage,
  },
  apropos: {
    badge: 'À propos',
    badgeColor: COLORS.purple,
    title: "L'histoire de Qrioo",
    component: AproposPage,
  },
  blog: {
    badge: 'Blog',
    badgeColor: COLORS.emerald,
    title: 'Actualités et conseils',
    component: BlogPage,
  },
  carrieres: {
    badge: 'Carrières',
    badgeColor: COLORS.amber,
    title: "Rejoignez l'aventure Qrioo",
    component: CarrieresPage,
  },
  contact: {
    badge: 'Contact',
    badgeColor: COLORS.emerald,
    title: 'Parlons de votre projet',
    component: ContactPage,
  },
  confidentialite: {
    badge: 'Confidentialité',
    badgeColor: COLORS.purple,
    title: 'Politique de Confidentialité',
    component: () => <LegalPage sections={CONFIDENTIALITE_SECTIONS} />,
  },
  cgu: {
    badge: 'CGU',
    badgeColor: COLORS.purple,
    title: 'Conditions Générales d\'Utilisation',
    component: () => <LegalPage sections={CGU_SECTIONS} />,
  },
  'mentions-legales': {
    badge: 'Mentions légales',
    badgeColor: COLORS.purple,
    title: 'Mentions Légales',
    component: () => <LegalPage sections={MENTIONS_SECTIONS} />,
  },
};

/* ================================================================== */
/*  MAIN COMPONENT                                                    */
/* ================================================================== */

interface FooterPagesProps {
  pageId: string;
  onBack: () => void;
}

export default function FooterPages({ pageId, onBack }: FooterPagesProps) {
  const config = PAGE_MAP[pageId];

  if (!config) {
    return (
      <SubPageLayout title="Page introuvable" onBack={onBack}>
        <div className="py-24 text-center">
          <p className="text-gray-500">La page demandée n\'existe pas.</p>
        </div>
      </SubPageLayout>
    );
  }

  const ContentComponent = config.component;

  return (
    <SubPageLayout
      title={config.title}
      subtitle={config.subtitle}
      badge={config.badge}
      badgeColor={config.badgeColor}
      onBack={onBack}
    >
      <ContentComponent />
    </SubPageLayout>
  );
}
