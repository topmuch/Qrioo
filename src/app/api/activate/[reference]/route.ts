import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ─── Zod schemas par pack_type ───────────────────────────────────

const pratiqueSchema = z.object({
  travelerFirstName: z.string().min(1, 'Prénom requis'),
  travelerLastName: z.string().min(1, 'Nom requis'),
  whatsappOwner: z.string().min(6, 'Numéro WhatsApp requis'),
  category: z.string().optional(),
  category_label: z.string().optional(),
  object_name: z.string().optional(),
  object_description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  reward: z.string().optional(),
  message_to_finder: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const emotionSchema = z.object({
  senderName: z.string().min(1, 'Nom de l\'expéditeur requis'),
  recipientName: z.string().min(1, 'Nom du destinataire requis'),
  contentType: z.enum(['text', 'audio']),
  message: z.string().optional(),
  contentUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

const evenementielSchema = z.object({
  eventName: z.string().min(1, 'Nom de l\'événement requis'),
  eventDate: z.string().min(1, 'Date requise'),
  hostName: z.string().min(1, 'Nom de l\'organisateur requis'),
  eventDescription: z.string().optional(),
  eventType: z.string().optional(),
  guestBookEnabled: z.boolean().default(true),
  coverImage: z.string().url('URL invalide').optional().or(z.literal('')),
});

const immobilierSchema = z.object({
  propertyTitle: z.string().min(1, 'Titre du bien requis'),
  propertyType: z.enum(['appartement', 'maison', 'terrain', 'commercial', 'autre']),
  price: z.string().min(1, 'Prix requis'),
  surface: z.string().optional(),
  rooms: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  city: z.string().min(1, 'Ville requise'),
  address: z.string().optional(),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  photos: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

const PENDING_STATUSES = new Set(['in_stock', 'assigned_to_agency', 'sold', 'pending_activation']);

// ─── GET : vérifier le statut d'un tag pour activation ───────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    const baggage = await prisma.baggage.findUnique({
      where: { reference },
      select: {
        id: true,
        reference: true,
        packType: true,
        status: true,
        type: true,
        contentType: true,
        contentUrl: true,
        contentMetadata: true,
        travelerFirstName: true,
        travelerLastName: true,
        whatsappOwner: true,
        agency: { select: { id: true, name: true } },
      },
    });

    if (!baggage) {
      return NextResponse.json(
        { error: 'Tag introuvable' },
        { status: 404 }
      );
    }

    const isPending = PENDING_STATUSES.has(baggage.status);
    const isActive = baggage.status === 'activated';

    let metadata: Record<string, unknown> | null = null;
    if (baggage.contentMetadata) {
      try { metadata = JSON.parse(baggage.contentMetadata); } catch { /* ignore */ }
    }

    return NextResponse.json({
      reference: baggage.reference,
      packType: baggage.packType || 'pratique',
      status: baggage.status,
      canActivate: isPending,
      alreadyActive: isActive,
      contentType: baggage.contentType,
      contentUrl: baggage.contentUrl,
      contentMetadata: metadata,
      travelerFirstName: baggage.travelerFirstName,
      travelerLastName: baggage.travelerLastName,
      whatsappOwner: baggage.whatsappOwner,
      agency: baggage.agency,
      type: baggage.type,
    });
  } catch (error) {
    console.error('[activate GET] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ─── POST : activer un tag avec données par pack_type ───────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await request.json();

    // ── 1. Récupérer le tag ──────────────────────────────────
    const baggage = await prisma.baggage.findUnique({
      where: { reference },
      include: { agency: true },
    });

    if (!baggage) {
      return NextResponse.json(
        { error: 'Tag introuvable' },
        { status: 404 }
      );
    }

    if (!PENDING_STATUSES.has(baggage.status)) {
      return NextResponse.json(
        { error: 'Ce tag est déjà activé ou bloqué', code: 'ALREADY_ACTIVE' },
        { status: 400 }
      );
    }

    const packType = baggage.packType || 'pratique';

    // ── 2. Valider selon pack_type ───────────────────────────
    let updateData: Record<string, unknown> = {
      status: 'activated',
      scanCount: 0,
      isLost: false,
      declaredLostAt: null,
      foundAt: null,
    };

    // Date d'expiration : 1 an
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    updateData.expiresAt = expiresAt;

    switch (packType) {
      // ─── PRATIQUE ────────────────────────────────────────
      case 'pratique': {
        const parsed = pratiqueSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Erreur de validation', details: parsed.error.issues, code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }
        const d = parsed.data;
        updateData.travelerFirstName = d.travelerFirstName;
        updateData.travelerLastName = d.travelerLastName;
        updateData.whatsappOwner = d.whatsappOwner;

        // Custom data pour les champs objets
        const customData: Record<string, string> = {};
        if (d.category) customData.category = d.category;
        if (d.category_label) customData.category_label = d.category_label;
        if (d.object_name) customData.object_name = d.object_name;
        if (d.object_description) customData.object_description = d.object_description;
        if (d.brand) customData.brand = d.brand;
        if (d.model) customData.model = d.model;
        if (d.color) customData.color = d.color;
        if (d.reward) customData.reward = d.reward;
        if (d.message_to_finder) customData.message_to_finder = d.message_to_finder;
        if (d.city) customData.city = d.city;
        if (d.country) customData.country = d.country;
        if (Object.keys(customData).length > 0) {
          updateData.customData = JSON.stringify(customData);
        }
        break;
      }

      // ─── EMOTION ─────────────────────────────────────────
      case 'emotion': {
        const parsed = emotionSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Erreur de validation', details: parsed.error.issues, code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }
        const d = parsed.data;
        updateData.travelerFirstName = d.senderName;
        updateData.travelerLastName = '';
        updateData.contentType = d.contentType;
        updateData.contentUrl = d.contentUrl && d.contentUrl.trim() !== '' ? d.contentUrl : null;

        const metadata: Record<string, unknown> = {
          senderName: d.senderName,
          recipientName: d.recipientName,
          message: d.message || null,
        };
        updateData.contentMetadata = JSON.stringify(metadata);
        break;
      }

      // ─── EVENEMENTIEL ────────────────────────────────────
      case 'evenementiel': {
        const parsed = evenementielSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Erreur de validation', details: parsed.error.issues, code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }
        const d = parsed.data;
        updateData.travelerFirstName = d.hostName;
        updateData.travelerLastName = '';

        const metadata: Record<string, unknown> = {
          eventName: d.eventName,
          eventDate: d.eventDate,
          hostName: d.hostName,
          eventDescription: d.eventDescription || null,
          eventType: d.eventType || null,
          guestBookEnabled: d.guestBookEnabled,
          coverImage: d.coverImage && d.coverImage.trim() !== '' ? d.coverImage : null,
        };
        updateData.contentMetadata = JSON.stringify(metadata);
        break;
      }

      // ─── IMMOBILIER ──────────────────────────────────────
      case 'immobilier': {
        const parsed = immobilierSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: 'Erreur de validation', details: parsed.error.issues, code: 'VALIDATION_ERROR' },
            { status: 400 }
          );
        }
        const d = parsed.data;
        updateData.travelerFirstName = d.contactName || d.propertyTitle;
        updateData.travelerLastName = '';
        updateData.whatsappOwner = d.contactPhone || null;

        const metadata: Record<string, unknown> = {
          propertyTitle: d.propertyTitle,
          propertyType: d.propertyType,
          price: d.price,
          surface: d.surface || null,
          rooms: d.rooms || null,
          bedrooms: d.bedrooms || null,
          bathrooms: d.bathrooms || null,
          city: d.city,
          address: d.address || null,
          description: d.description || null,
          contactName: d.contactName || null,
          contactPhone: d.contactPhone || null,
          contactEmail: (d.contactEmail && d.contactEmail.trim() !== '') ? d.contactEmail : null,
          photos: d.photos || [],
          features: d.features || [],
        };
        updateData.contentMetadata = JSON.stringify(metadata);
        break;
      }

      default: {
        return NextResponse.json(
          { error: `Pack type "${packType}" non supporté pour l'activation` },
          { status: 400 }
        );
      }
    }

    // ── 3. Mise à jour en base ──────────────────────────────
    const updated = await prisma.baggage.update({
      where: { id: baggage.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Tag activé avec succès',
      baggage: {
        id: updated.id,
        reference: updated.reference,
        packType: updated.packType,
        status: updated.status,
        contentType: updated.contentType,
        expiresAt: updated.expiresAt,
      },
    });
  } catch (error) {
    console.error('[activate POST] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
