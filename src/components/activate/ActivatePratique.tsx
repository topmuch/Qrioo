'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Package,
  ChevronDown,
  QrCode,
  Loader2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PratiqueFormData {
  travelerFirstName: string;
  travelerLastName: string;
  whatsappOwner: string;
  object_name?: string;
  object_description?: string;
  category?: string;
  brand?: string;
  model?: string;
  color?: string;
  message_to_finder?: string;
}

export interface ActivatePratiqueProps {
  onSubmit: (data: PratiqueFormData) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Category options for the select dropdown
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    group: 'Voyage',
    items: ['Valise', 'Sac à dos', "Sac à main", 'Autre'],
  },
  {
    group: 'Tech',
    items: ['Téléphone', 'Tablette', 'Ordinateur', 'Autre'],
  },
  {
    group: 'Loisirs',
    items: ['Vélo', 'Sac de sport', 'Parapluie', 'Autre'],
  },
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

export default function ActivatePratique({ onSubmit, isLoading }: ActivatePratiqueProps) {
  // ---- Owner info (required) ----
  const [travelerFirstName, setTravelerFirstName] = useState('');
  const [travelerLastName, setTravelerLastName] = useState('');
  const [whatsappOwner, setWhatsappOwner] = useState('');

  // ---- Object description (optional) ----
  const [category, setCategory] = useState('');
  const [object_name, setObject_name] = useState('');
  const [object_description, setObject_description] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [message_to_finder, setMessage_to_finder] = useState('');

  // Collapsible state for optional section
  const [objectSectionOpen, setObjectSectionOpen] = useState(false);

  // ------------------------------------------------------------------------
  // Form submission
  // ------------------------------------------------------------------------

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit({
      travelerFirstName: travelerFirstName.trim(),
      travelerLastName: travelerLastName.trim(),
      whatsappOwner: whatsappOwner.trim(),
      object_name: object_name.trim() || undefined,
      object_description: object_description.trim() || undefined,
      category: category || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      color: color.trim() || undefined,
      message_to_finder: message_to_finder.trim() || undefined,
    });
  };

  // ------------------------------------------------------------------------
  // Derived state
  // ------------------------------------------------------------------------

  const isFormValid =
    travelerFirstName.trim().length > 0 &&
    travelerLastName.trim().length > 0 &&
    whatsappOwner.trim().length > 0;

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
        {/* Section 1 – Owner info                                          */}
        {/* ================================================================ */}
        <div className="border-l-4 border-l-amber-500 p-5 sm:p-6">
          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
              <User className="h-4.5 w-4.5 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Informations du propriétaire
            </h2>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              * Requis
            </span>
          </div>

          <div className="space-y-4">
            {/* First name */}
            <div className="space-y-1.5">
              <Label htmlFor="travelerFirstName" className="text-sm font-medium">
                Prénom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="travelerFirstName"
                type="text"
                required
                autoComplete="given-name"
                placeholder="Ex: Marie"
                value={travelerFirstName}
                onChange={(e) => setTravelerFirstName(e.target.value)}
                className="h-11 border-border focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            {/* Last name */}
            <div className="space-y-1.5">
              <Label htmlFor="travelerLastName" className="text-sm font-medium">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="travelerLastName"
                type="text"
                required
                autoComplete="family-name"
                placeholder="Ex: Dupont"
                value={travelerLastName}
                onChange={(e) => setTravelerLastName(e.target.value)}
                className="h-11 border-border focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            {/* WhatsApp / Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="whatsappOwner" className="text-sm font-medium">
                Numéro WhatsApp <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="whatsappOwner"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={whatsappOwner}
                  onChange={(e) => setWhatsappOwner(e.target.value)}
                  className="h-11 pl-10 border-border focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Section 2 – Object description (collapsible, optional)          */}
        {/* ================================================================ */}
        <Collapsible open={objectSectionOpen} onOpenChange={setObjectSectionOpen}>
          <div className="border-t border-border">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 border-l-4 border-l-amber-500 bg-muted/40 px-5 py-4 text-left transition-colors hover:bg-muted/60 sm:px-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Package className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-foreground">
                    Description de l'objet
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {objectSectionOpen
                      ? 'Cliquer pour replier'
                      : 'Optionnel – cliquer pour dérouler'}
                  </p>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    objectSectionOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-5 pb-5 pt-4 sm:px-6">
                <div className="space-y-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Catégorie
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger
                        id="category"
                        className="h-11 w-full border-border focus:border-amber-500 focus:ring-amber-500/20"
                      >
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((group) => (
                          <SelectGroup key={group.group}>
                            <SelectLabel>{group.group}</SelectLabel>
                            {group.items.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Object name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="object_name" className="text-sm font-medium">
                      Nom de l'objet
                    </Label>
                    <Input
                      id="object_name"
                      type="text"
                      placeholder="Ex: Valise noire Samsonite"
                      value={object_name}
                      onChange={(e) => setObject_name(e.target.value)}
                      className="h-11 border-border focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Object description */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="object_description"
                      className="text-sm font-medium"
                    >
                      Description détaillée
                    </Label>
                    <Textarea
                      id="object_description"
                      placeholder="Description détaillée de l'objet..."
                      rows={3}
                      value={object_description}
                      onChange={(e) => setObject_description(e.target.value)}
                      className="resize-none border-border focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Brand + Color – side by side on sm+ */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="brand" className="text-sm font-medium">
                        Marque
                      </Label>
                      <Input
                        id="brand"
                        type="text"
                        placeholder="Ex: Samsonite"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="h-11 border-border focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="color" className="text-sm font-medium">
                        Couleur
                      </Label>
                      <Input
                        id="color"
                        type="text"
                        placeholder="Ex: Noir"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-11 border-border focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Model */}
                  <div className="space-y-1.5">
                    <Label htmlFor="model" className="text-sm font-medium">
                      Modèle
                    </Label>
                    <Input
                      id="model"
                      type="text"
                      placeholder="Ex: Cosmolite"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="h-11 border-border focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Message to finder */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="message_to_finder"
                      className="text-sm font-medium"
                    >
                      Message pour le trouveur
                    </Label>
                    <Textarea
                      id="message_to_finder"
                      placeholder="Message que vous souhaitez envoyer au trouveur..."
                      rows={3}
                      value={message_to_finder}
                      onChange={(e) => setMessage_to_finder(e.target.value)}
                      className="resize-none border-border focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* ================================================================ */}
        {/* Submit                                                            */}
        {/* ================================================================ */}
        <div className="border-t border-border p-5 sm:p-6">
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="h-12 w-full rounded-xl bg-amber-500 text-white font-semibold text-base shadow-md hover:bg-amber-600 focus-visible:ring-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activation en cours…
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Activer ce tag
              </>
            )}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Votre tag sera actif pendant 1 an
          </p>
        </div>
      </form>
    </motion.div>
  );
}
