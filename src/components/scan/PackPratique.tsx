'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MessageCircle, User, Phone, MapPin, Send, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

const QRTAGS_BG = '#E3B23C';
const CARD_CLASS = 'bg-white rounded-xl p-6 shadow-xl border-2 border-black';

interface ObjectInfo {
  category?: string | null;
  category_label?: string | null;
  object_name?: string | null;
  object_description?: string | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  reward?: string | null;
  message_to_finder?: string | null;
  city?: string | null;
  country?: string | null;
  photo?: string | null;
}

interface BaggageData {
  reference: string;
  type: string;
  travelerName: string;
  travelerFirstName?: string | null;
  status: string;
  agency?: string | null;
  whatsappOwner?: string | null;
  isLost?: boolean;
  objectInfo?: ObjectInfo | null;
}

interface PackPratiqueProps {
  reference: string;
  baggage: BaggageData;
}

export default function PackPratique({ reference, baggage }: PackPratiqueProps) {
  const [finderName, setFinderName] = useState('');
  const [finderPhone, setFinderPhone] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finderName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/scan/${reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finderName: finderName.trim(),
          finderPhone: finderPhone.trim(),
          message: message.trim() || null,
          location: location.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.whatsappUrl) {
        setWhatsappUrl(data.whatsappUrl);
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLost = baggage.isLost;
  const info = baggage.objectInfo;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: QRTAGS_BG }}>
      <div className={`${CARD_CLASS} max-w-md w-full`}
        style={{ borderColor: isLost ? '#DC2626' : '#111' }}
      >
        {isLost && (
          <div className="bg-red-100 border-b-2 border-red-500 px-4 py-3 rounded-t-xl">
            <p className="text-red-700 font-bold text-sm text-center">&#9888;&#65039; Cet objet est signale perdu</p>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-black text-black">Objet trouve</h1>
              <p className="text-sm text-black/60">Ref: {reference}</p>
            </div>
          </div>

          {info?.object_name && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-black text-base">{info.object_name}</p>
              {info.brand && <p className="text-sm text-black/70">Marque: {info.brand}</p>}
              {info.color && <p className="text-sm text-black/70">Couleur: {info.color}</p>}
              {info.object_description && <p className="text-sm text-black/70 mt-1">{info.object_description}</p>}
            </div>
          )}

          {info?.message_to_finder && (
            <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-bold text-amber-800 mb-1">Message du proprietaire :</p>
              <p className="text-sm text-amber-900 italic">{info.message_to_finder}</p>
            </div>
          )}

          {baggage.agency && (
            <p className="text-xs text-black/50 mb-4">Gere par {baggage.agency}</p>
          )}
        </motion.div>

        {whatsappUrl ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <p className="font-bold text-black mb-4">Merci ! Vous allez etre redirige vers WhatsApp.</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition min-h-[48px]">
              <ExternalLink className="w-4 h-4" /> Ouvrir WhatsApp
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="finder-name" className="block text-sm font-bold text-black mb-1">
                <User className="w-3.5 h-3.5 inline mr-1" /> Votre nom <span className="text-red-500">*</span>
              </label>
              <input id="finder-name" type="text" value={finderName} onChange={(e) => setFinderName(e.target.value)} placeholder="Votre nom" required className="w-full min-h-[48px] px-4 py-3 border-2 border-black rounded-lg bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 transition text-base" />
            </div>
            <div>
              <label htmlFor="finder-phone" className="block text-sm font-bold text-black mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Telephone (optionnel)
              </label>
              <input id="finder-phone" type="tel" value={finderPhone} onChange={(e) => setFinderPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full min-h-[48px] px-4 py-3 border-2 border-black rounded-lg bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 transition text-base" />
            </div>
            <div>
              <label htmlFor="finder-location" className="block text-sm font-bold text-black mb-1">
                <MapPin className="w-3.5 h-3.5 inline mr-1" /> Lieu de trouvaille (optionnel)
              </label>
              <input id="finder-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Aeroport CDG, Terminal 2" className="w-full min-h-[48px] px-4 py-3 border-2 border-black rounded-lg bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 transition text-base" />
            </div>
            <div>
              <label htmlFor="finder-msg" className="block text-sm font-bold text-black mb-1">
                <MessageCircle className="w-3.5 h-3.5 inline mr-1" /> Message (optionnel)
              </label>
              <textarea id="finder-msg" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Details sur la trouvaille..." className="w-full px-4 py-3 border-2 border-black rounded-lg bg-gray-50 text-black placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-300 transition text-base resize-none" />
            </div>
            <button type="submit" disabled={isSubmitting || !finderName.trim()} className="w-full px-6 py-3.5 rounded-lg font-black text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-h-[48px]" style={{ backgroundColor: QRTAGS_BG }} >
              {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</>) : (<><Send className="w-4 h-4" /> Prevenir le proprietaire</>)}
            </button>
          </form>
        )}

        <div className="mt-4 pt-4 border-t border-black/10 text-center">
          <p className="text-black/40 text-xs">Propulse par <span className="font-bold text-black/60">Qrioo</span></p>
        </div>
      </div>
    </main>
  );
}
