'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Heart,
  MessageSquare,
  Mic,
  Loader2,
  Upload,
  Sparkles,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmotionFormData {
  senderName: string;
  recipientName: string;
  contentType: 'text' | 'audio';
  message?: string;
  contentUrl?: string;
}

export interface ActivateEmotionProps {
  onSubmit: (data: EmotionFormData) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_MESSAGE_LENGTH = 500;

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

export default function ActivateEmotion({ onSubmit, isLoading }: ActivateEmotionProps) {
  // ---- Sender / Recipient ----
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // ---- Content type ----
  const [contentType, setContentType] = useState<'text' | 'audio'>('text');

  // ---- Text message ----
  const [message, setMessage] = useState('');

  // ---- Audio ----
  const [contentUrl, setContentUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ------------------------------------------------------------------------
  // File handling
  // ------------------------------------------------------------------------

  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ------------------------------------------------------------------------
  // Form submission
  // ------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      senderName: senderName.trim(),
      recipientName: recipientName.trim(),
      contentType,
      message: contentType === 'text' ? message.trim() || undefined : undefined,
      contentUrl: contentType === 'audio' ? contentUrl.trim() || undefined : undefined,
    });
  };

  // ------------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------------

  const isFormValid =
    senderName.trim().length > 0 &&
    recipientName.trim().length > 0 &&
    (contentType === 'text' ? message.trim().length > 0 : true);

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <motion.div {...fadeIn} className="relative w-full max-w-lg mx-auto">
      {/* Decorative floating elements */}
      <div className="pointer-events-none absolute -top-6 -right-4 h-8 w-8 animate-bounce rounded-full bg-purple-200/60" />
      <div className="pointer-events-none absolute -top-3 right-16 h-5 w-5 animate-pulse rounded-full bg-pink-200/50" />
      <div className="pointer-events-none absolute bottom-12 -left-3 h-6 w-6 animate-pulse rounded-full bg-purple-300/40" />
      <Heart className="pointer-events-none absolute -top-4 left-10 h-5 w-5 animate-pulse text-purple-300/50" />
      <Sparkles className="pointer-events-none absolute bottom-20 -right-2 h-4 w-4 animate-pulse text-pink-300/50" />

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-purple-100 bg-white shadow-sm overflow-hidden"
      >
        {/* ================================================================ */}
        {/* Section 1 – Qui envoie ce message ?                              */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-purple-500 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
              <User className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Qui envoie ce message ?
            </h2>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              * Requis
            </span>
          </div>

          <div className="space-y-4">
            {/* Sender name */}
            <div className="space-y-1.5">
              <Label htmlFor="senderName" className="text-sm font-medium">
                Votre nom <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="senderName"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Ex: Maman"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="h-11 pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Recipient name */}
            <div className="space-y-1.5">
              <Label htmlFor="recipientName" className="text-sm font-medium">
                Nom du destinataire <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Heart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="recipientName"
                  type="text"
                  required
                  autoComplete="given-name"
                  placeholder="Ex: Ma chérie Sophie"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="h-11 pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Section 2 – Type de contenu                                       */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-purple-500 border-t border-t-purple-100 p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
              <MessageSquare className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Type de contenu
            </h2>
          </div>

          <RadioGroup
            value={contentType}
            onValueChange={(v) => setContentType(v as 'text' | 'audio')}
            className="grid grid-cols-2 gap-3"
          >
            {/* Text option */}
            <label
              htmlFor="type-text"
              className={`relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                contentType === 'text'
                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40'
              }`}
            >
              <RadioGroupItem value="text" id="type-text" className="sr-only" />
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  contentType === 'text' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Message texte
              </span>
              <span className="text-xs text-muted-foreground leading-snug">
                Un message écrit personnel
              </span>
            </label>

            {/* Audio option */}
            <label
              htmlFor="type-audio"
              className={`relative flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-center transition-all duration-200 ${
                contentType === 'audio'
                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40'
              }`}
            >
              <RadioGroupItem value="audio" id="type-audio" className="sr-only" />
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  contentType === 'audio' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Mic className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Message audio
              </span>
              <span className="text-xs text-muted-foreground leading-snug">
                Enregistrez votre voix
              </span>
            </label>
          </RadioGroup>
        </div>

        {/* ================================================================ */}
        {/* Section 3 – Conditional content                                   */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-purple-500 border-t border-t-purple-100 p-5 sm:p-6">
          {contentType === 'text' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <MessageSquare className="h-4.5 w-4.5 text-purple-600" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Votre message
                </h2>
              </div>
              <div className="relative">
                <Textarea
                  id="emotion-message"
                  placeholder="Écrivez votre message ici..."
                  rows={4}
                  maxLength={MAX_MESSAGE_LENGTH}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none border-purple-200 bg-purple-50/30 focus:border-purple-500 focus:ring-purple-500/20 min-h-[120px]"
                />
                <span className="absolute bottom-3 right-3 text-xs text-muted-foreground tabular-nums">
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <Mic className="h-4.5 w-4.5 text-purple-600" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                  Votre audio
                </h2>
              </div>

              {/* Dropzone */}
              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') openFilePicker();
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                  isDragOver
                    ? 'border-purple-500 bg-purple-50'
                    : audioFile
                      ? 'border-purple-300 bg-purple-50/60'
                      : 'border-purple-200 bg-purple-50/20 hover:border-purple-400 hover:bg-purple-50/40'
                }`}
              >
                {audioFile ? (
                  <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100">
                      <Mic className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {audioFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} Mo — Cliquez pour changer
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100">
                      <Upload className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Cliquez ou glissez un fichier audio
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, OGG, M4A
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-purple-100" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ou
                </span>
                <div className="h-px flex-1 bg-purple-100" />
              </div>

              {/* URL input */}
              <div className="space-y-1.5">
                <Label htmlFor="contentUrl" className="text-sm font-medium">
                  Ou collez une URL d'audio
                </Label>
                <Input
                  id="contentUrl"
                  type="url"
                  placeholder="https://exemple.com/mon-audio.mp3"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  className="h-11 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* Submit                                                            */}
        {/* ================================================================ */}
        <div className="border-t border-t-purple-100 p-5 sm:p-6">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-base shadow-md hover:from-purple-700 hover:to-pink-700 focus-visible:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours…
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Créer ce message
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Le destinataire verra une animation d'enveloppe avant de découvrir votre message
          </p>
        </div>
      </form>
    </motion.div>
  );
}
