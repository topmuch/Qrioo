'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MessageCircle, Send, Loader2, User,
  PartyPopper, Heart, Sparkles,
} from 'lucide-react';

const QRIOO_PURPLE = '#7C3AED';

interface GuestMessage {
  id: string;
  authorName: string;
  content: string;
  contentType: string | null;
  contentUrl: string | null;
  createdAt: string;
}

interface PackEvenementielProps {
  reference: string;
  contentMetadata: Record<string, unknown> | null;
  travelerName: string | null;
  initialMessages: GuestMessage[];
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

function formatTimeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "A l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `Il y a ${diffD}j`;
    return formatDate(dateStr);
  } catch { return ''; }
}

function MessageBubble({ message }: { message: GuestMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-pink-100"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {message.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm truncate">{message.authorName}</p>
            <span className="text-xs text-gray-400 flex-shrink-0">{formatTimeAgo(message.createdAt)}</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PackEvenementiel({
  reference, contentMetadata, travelerName, initialMessages,
}: PackEvenementielProps) {
  const meta = contentMetadata || {};
  const eventName = (meta.eventName as string) || 'Evenement';
  const eventDate = meta.eventDate as string | null;

  const [messages, setMessages] = useState<GuestMessage[]>(initialMessages);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!guestName.trim() || !guestMessage.trim()) {
      alert('Veuillez entrer votre nom et votre message.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/scan/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'guest_message',
          authorName: guestName.trim(),
          content: guestMessage.trim(),
          contentType: 'text',
        }),
      });
      const data = await res.json();
      if (data.success && data.guestMessage) {
        setMessages((prev) => [data.guestMessage, ...prev]);
        setGuestMessage('');
      } else {
        alert(data.error || 'Erreur lors de l\'envoi');
      }
    } catch {
      alert('Erreur lors de l\'envoi');
    } finally {
      setIsSubmitting(false);
    }
  }, [guestName, guestMessage, reference]);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FDF2F8 0%, #FAF5FF 40%, #FFFFFF 100%)' }}>
      {/* ─── Event Header ─── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 80%, #F472B6 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 right-8 text-3xl opacity-20">&#127881;</div>
          <div className="absolute bottom-8 left-6 text-2xl opacity-15">&#10024;</div>
          <div className="absolute top-12 left-16 text-xl opacity-20">&#127882;</div>
        </div>
        <div className="relative z-10 px-5 py-8 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4"
          >
            <PartyPopper className="w-8 h-8" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black mb-2">{eventName}</h1>
          {eventDate && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{formatDate(eventDate)}</span>
            </div>
          )}
          {travelerName && (
            <p className="text-white/80 text-sm mt-3">Organise par {travelerName}</p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 60V20C240 60 480 0 720 20C960 40 1200 10 1440 30V60H0Z" fill="#FDF2F8" />
          </svg>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5" style={{ color: QRIOO_PURPLE }} />
            <h2 className="text-lg font-bold text-gray-900">Livre d'or</h2>
            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin' }}>
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <Heart className="w-10 h-10 mx-auto mb-3 text-pink-200" />
                  <p className="text-gray-400 text-sm">Soyez le premier a laisser un message !</p>
                </motion.div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-pink-100 p-5 mt-auto"
        >
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: QRIOO_PURPLE }} />
            Laisser un message
          </h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="guest-name" className="block text-sm font-bold text-gray-700 mb-1">
                <User className="w-3 h-3 inline mr-1" /> Votre nom <span className="text-red-500">*</span>
              </label>
              <input id="guest-name" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Prenom ou pseudo" className="w-full min-h-[44px] px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm" required />
            </div>
            <div>
              <label htmlFor="guest-msg" className="block text-sm font-bold text-gray-700 mb-1">
                <MessageCircle className="w-3 h-3 inline mr-1" /> Votre message <span className="text-red-500">*</span>
              </label>
              <textarea id="guest-msg" rows={3} value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} placeholder="Felicitations, bons souhaits, souvenirs..." className="w-full min-h-[44px] px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition text-sm resize-none" required />
            </div>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting || !guestName.trim() || !guestMessage.trim()} className="w-full px-5 py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-h-[48px]" style={{ backgroundColor: QRIOO_PURPLE }} >
              {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</>) : (<><Send className="w-4 h-4" /> Envoyer</>)}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="text-center py-6 mt-auto">
        <p className="text-gray-400 text-sm">Propulse par <span className="font-bold text-gray-600">Qrioo</span></p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: QRIOO_PURPLE }} />
          <span className="text-gray-400 text-xs">Vos moments, vos souvenirs</span>
        </div>
      </div>
    </main>
  );
}
