'use client';

import { useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  X,
  Loader2,
  Ruler,
  BedDouble,
  Bath,
  DoorOpen,
  Sparkles,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

export interface ImmobilierFormData {
  propertyTitle: string;
  propertyType: string;
  price: string;
  surface?: string;
  rooms?: string;
  bedrooms?: string;
  bathrooms?: string;
  city: string;
  address?: string;
  description?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  photos?: string[];
  features?: string[];
}

export interface ActivateImmobilierProps {
  onSubmit: (data: ImmobilierFormData) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROPERTY_TYPES = [
  'Appartement',
  'Maison',
  'Terrain',
  'Commercial',
  'Autre',
] as const;

const SUGGESTED_FEATURES = [
  'Parking',
  'Jardin',
  'Piscine',
  'Ascenseur',
  'Cave',
  'Terrasse',
  'Balcon',
] as const;

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' as const },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActivateImmobilier({
  onSubmit,
  isLoading,
}: ActivateImmobilierProps) {
  // ---- Section 1: Le bien ----
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  // ---- Section 2: Caractéristiques ----
  const [surface, setSurface] = useState('');
  const [rooms, setRooms] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  // ---- Section 3: Description & Contact ----
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // ------------------------------------------------------------------------
  // Feature tag helpers
  // ------------------------------------------------------------------------

  const addFeature = (feature: string) => {
    const trimmed = feature.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
    }
    setFeatureInput('');
  };

  const removeFeature = (feature: string) => {
    setFeatures((prev) => prev.filter((f) => f !== feature));
  };

  const handleFeatureKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature(featureInput);
    }
  };

  // ------------------------------------------------------------------------
  // Form submission
  // ------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      propertyTitle: propertyTitle.trim(),
      propertyType,
      price: price.trim(),
      city: city.trim(),
      surface: surface.trim() || undefined,
      rooms: rooms.trim() || undefined,
      bedrooms: bedrooms.trim() || undefined,
      bathrooms: bathrooms.trim() || undefined,
      address: address.trim() || undefined,
      description: description.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      features: features.length > 0 ? features : undefined,
    });
  };

  // ------------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------------

  const isFormValid =
    propertyTitle.trim().length > 0 &&
    propertyType.length > 0 &&
    price.trim().length > 0 &&
    city.trim().length > 0;

  // ------------------------------------------------------------------------
  // Shared input classes
  // ------------------------------------------------------------------------

  const inputClass =
    'h-11 border-border focus:border-slate-500 focus:ring-slate-500/20';

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <motion.div {...fadeIn} className="w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
      >
        {/* ================================================================ */}
        {/* Section 1 – Le bien                                               */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-slate-600 p-5 sm:p-6">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <Building2 className="h-4.5 w-4.5 text-slate-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Le bien</h2>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              * Requis
            </span>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="propertyTitle" className="text-sm font-medium">
                Titre de l'annonce <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="propertyTitle"
                  type="text"
                  required
                  placeholder="Ex: T3 lumineux vue mer"
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  className={`pl-10 ${inputClass}`}
                />
              </div>
            </div>

            {/* Property type */}
            <div className="space-y-1.5">
              <Label htmlFor="propertyType" className="text-sm font-medium">
                Type de bien <span className="text-red-500">*</span>
              </Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger
                  id="propertyType"
                  className={`h-11 w-full ${inputClass}`}
                >
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-sm font-medium">
                Prix <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="price"
                  type="text"
                  required
                  placeholder='Ex: 250 000 € ou 850 €/mois'
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`pl-10 ${inputClass}`}
                />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm font-medium">
                Ville <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="city"
                  type="text"
                  required
                  placeholder="Ex: Nice, Paris, Dakar"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`pl-10 ${inputClass}`}
                />
              </div>
            </div>

            {/* Address (optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">
                Adresse
              </Label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Ex: 12 rue de la Paix"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`pl-10 ${inputClass}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Section 2 – Caractéristiques                                      */}
        {/* ================================================================ */}
        <div className="border-t border-border border-l-4 border-l-slate-600 p-5 sm:p-6">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <Ruler className="h-4.5 w-4.5 text-slate-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Caractéristiques
            </h2>
          </div>

          <div className="space-y-4">
            {/* Compact 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Surface */}
              <div className="space-y-1.5">
                <Label htmlFor="surface" className="text-sm font-medium">
                  Surface
                </Label>
                <div className="relative">
                  <Ruler className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="surface"
                    type="text"
                    placeholder="Ex: 75 m²"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    className={`pl-9 text-sm ${inputClass}`}
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-1.5">
                <Label htmlFor="rooms" className="text-sm font-medium">
                  Pièces
                </Label>
                <div className="relative">
                  <DoorOpen className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="rooms"
                    type="text"
                    placeholder="Ex: 4"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className={`pl-9 text-sm ${inputClass}`}
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-1.5">
                <Label htmlFor="bedrooms" className="text-sm font-medium">
                  Chambres
                </Label>
                <div className="relative">
                  <BedDouble className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="bedrooms"
                    type="text"
                    placeholder="Ex: 2"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className={`pl-9 text-sm ${inputClass}`}
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-1.5">
                <Label htmlFor="bathrooms" className="text-sm font-medium">
                  Salles de bain
                </Label>
                <div className="relative">
                  <Bath className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="bathrooms"
                    type="text"
                    placeholder="Ex: 1"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className={`pl-9 text-sm ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            {/* Features – tag input */}
            <div className="space-y-2">
              <Label htmlFor="featureInput" className="text-sm font-medium">
                Équipements &amp; atouts
              </Label>

              {/* Existing tags */}
              {features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-0.5 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                        aria-label={`Retirer ${feature}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Text input */}
              <div className="relative">
                <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="featureInput"
                  type="text"
                  placeholder="Taper un équipement puis Entrée"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  className={`pl-10 ${inputClass}`}
                />
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_FEATURES.filter(
                  (s) => !features.includes(s)
                ).map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addFeature(suggestion)}
                    className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Section 3 – Description & Contact                                */}
        {/* ================================================================ */}
        <div className="border-t border-border border-l-4 border-l-slate-600 p-5 sm:p-6">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <Mail className="h-4.5 w-4.5 text-slate-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Description &amp; Contact
            </h2>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Description du bien
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre bien en détail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none border-border focus:border-slate-500 focus:ring-slate-500/20"
              />
            </div>

            {/* Contact name */}
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="text-sm font-medium">
                Nom du contact
              </Label>
              <Input
                id="contactName"
                type="text"
                placeholder="Ex: M. Diallo"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Contact phone + email side by side on sm+ */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone" className="text-sm font-medium">
                  Téléphone
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contactPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+221 77 123 45 67"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={`pl-10 ${inputClass}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="contactEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="contact@agence.sn"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={`pl-10 ${inputClass}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Submit                                                            */}
        {/* ================================================================ */}
        <div className="border-t border-border p-5 sm:p-6">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold text-base shadow-md hover:from-slate-600 hover:to-slate-800 focus-visible:ring-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication en cours…
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Publier cette annonce
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Les visiteurs scanneront le QR code pour voir les détails du bien et vous
            contacter
          </p>
        </div>
      </form>
    </motion.div>
  );
}
