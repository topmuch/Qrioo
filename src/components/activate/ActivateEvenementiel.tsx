'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Image,
  PartyPopper,
  Loader2,
  BookOpen,
  Star,
  Sparkles,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EvenementielFormData {
  eventName: string;
  eventDate: string;
  hostName: string;
  eventDescription?: string;
  eventType?: string;
  guestBookEnabled: boolean;
  coverImage?: string;
}

export interface ActivateEvenementielProps {
  onSubmit: (data: EvenementielFormData) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_TYPES = [
  { value: 'mariage', label: 'Mariage' },
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'bapteme', label: 'Baptême' },
  { value: 'conference', label: 'Conférence' },
  { value: 'salon', label: 'Salon' },
  { value: 'concert', label: 'Concert' },
  { value: 'fete-entreprise', label: "Fête d'entreprise" },
  { value: 'autre', label: 'Autre' },
] as const;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActivateEvenementiel({
  onSubmit,
  isLoading,
}: ActivateEvenementielProps) {
  // ---- Événement ----
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [hostName, setHostName] = useState('');

  // ---- Détails ----
  const [eventDescription, setEventDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // ---- Options ----
  const [guestBookEnabled, setGuestBookEnabled] = useState(true);

  // ------------------------------------------------------------------------
  // Form submission
  // ------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      eventName: eventName.trim(),
      eventDate,
      hostName: hostName.trim(),
      eventDescription: eventDescription.trim() || undefined,
      eventType: eventType || undefined,
      guestBookEnabled,
      coverImage: coverImage.trim() || undefined,
    });
  };

  // ------------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------------

  const isFormValid =
    eventName.trim().length > 0 &&
    eventDate.length > 0 &&
    hostName.trim().length > 0;

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <motion.div {...fadeIn} className="relative w-full max-w-lg mx-auto">
      {/* Decorative floating elements */}
      <div className="pointer-events-none absolute -top-6 -right-4 h-8 w-8 animate-bounce rounded-full bg-emerald-200/60" />
      <div className="pointer-events-none absolute -top-3 right-16 h-5 w-5 animate-pulse rounded-full bg-teal-200/50" />
      <div className="pointer-events-none absolute bottom-12 -left-3 h-6 w-6 animate-pulse rounded-full bg-emerald-300/40" />
      <Star className="pointer-events-none absolute -top-4 left-10 h-5 w-5 animate-pulse text-emerald-300/50" />
      <Sparkles className="pointer-events-none absolute bottom-20 -right-2 h-4 w-4 animate-pulse text-teal-300/50" />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-emerald-100 bg-white shadow-sm overflow-hidden"
      >
        {/* ================================================================ */}
        {/* Section 1 – Informations de l'événement                         */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-emerald-500 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
              <Calendar className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Informations de l&apos;événement
            </h2>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              * Requis
            </span>
          </div>

          <div className="space-y-4">
            {/* Event name */}
            <div className="space-y-1.5">
              <Label htmlFor="eventName" className="text-sm font-medium">
                Nom de l&apos;événement <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="eventName"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Ex: Mariage de Sophie & Pierre"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="h-11 pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Event date */}
            <div className="space-y-1.5">
              <Label htmlFor="eventDate" className="text-sm font-medium">
                Date de l&apos;événement <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="eventDate"
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="h-11 pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Event type */}
            <div className="space-y-1.5">
              <Label htmlFor="eventType" className="text-sm font-medium">
                Type d&apos;événement
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger
                  id="eventType"
                  className="h-11 w-full border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white"
                >
                  <SelectValue placeholder="Sélectionnez un type…" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Host name */}
            <div className="space-y-1.5">
              <Label htmlFor="hostName" className="text-sm font-medium">
                Nom de l&apos;organisateur <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="hostName"
                  type="text"
                  required
                  autoComplete="organization"
                  placeholder="Ex: Famille Dupont"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="h-11 pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Section 2 – Détails                                              */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-emerald-500 border-t border-t-emerald-100 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
              <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Détails
            </h2>
          </div>

          <div className="space-y-4">
            {/* Event description */}
            <div className="space-y-1.5">
              <Label htmlFor="eventDescription" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="eventDescription"
                placeholder="Décrivez votre événement…"
                rows={3}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="resize-none border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {/* Cover image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="coverImage" className="text-sm font-medium">
                Image de couverture
              </Label>
              <div className="relative">
                <Image className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="coverImage"
                  type="url"
                  placeholder="URL de l'image de couverture (optionnel)"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="h-11 pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Section 3 – Options                                              */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-emerald-500 border-t border-t-emerald-100 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
              <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Options
            </h2>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="guestBookEnabled" className="text-sm font-medium cursor-pointer">
                Activer le livre d&apos;or
              </Label>
              <p className="text-xs text-muted-foreground leading-snug">
                Les invités pourront laisser des messages en scannant le QR code
              </p>
            </div>
            <Switch
              id="guestBookEnabled"
              checked={guestBookEnabled}
              onCheckedChange={setGuestBookEnabled}
              className="data-[state=checked]:bg-emerald-600 shrink-0"
            />
          </div>
        </div>

        {/* ================================================================ */}
        {/* Submit                                                            */}
        {/* ================================================================ */}
        <div className="border-t border-t-emerald-100 p-5 sm:p-6">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-base shadow-md hover:from-emerald-700 hover:to-teal-700 focus-visible:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours…
              </>
            ) : (
              <>
                <PartyPopper className="mr-2 h-4 w-4" />
                Créer cet événement
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Les invités scanneront le QR code pour accéder aux infos et laisser des messages
          </p>
        </div>
      </form>
    </motion.div>
  );
}
