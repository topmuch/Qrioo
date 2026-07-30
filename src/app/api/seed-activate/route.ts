import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/seed-activate
 * Crée 4 tags en statut 'in_stock' (1 par pack_type) pour tester l'activation.
 * Idempotent : si un tag avec la même référence existe, il est ignoré.
 */
export async function POST() {
  try {
    const tags = [
      { reference: 'ACTIVATE-PRATIQUE-01', packType: 'pratique', type: 'voyageur' },
      { reference: 'ACTIVATE-EMOTION-01', packType: 'emotion', type: 'emotion' },
      { reference: 'ACTIVATE-EVENT-01', packType: 'evenementiel', type: 'evenementiel' },
      { reference: 'ACTIVATE-IMMO-01', packType: 'immobilier', type: 'immobilier' },
    ];

    const created: { reference: string; packType: string }[] = [];

    for (const tag of tags) {
      const exists = await prisma.baggage.findUnique({
        where: { reference: tag.reference },
        select: { id: true, status: true, packType: true },
      });

      if (exists) {
        // Reset to pending if already activated
        if (exists.status === 'activated') {
          await prisma.baggage.update({
            where: { id: exists.id },
            data: {
              status: 'in_stock',
              travelerFirstName: null,
              travelerLastName: null,
              whatsappOwner: null,
              contentType: null,
              contentUrl: null,
              contentMetadata: null,
              customData: null,
              scanCount: 0,
              isLost: false,
              declaredLostAt: null,
              foundAt: null,
              expiresAt: null,
            },
          });
        }
        created.push({ reference: tag.reference, packType: exists.packType });
      } else {
        await prisma.baggage.create({
          data: {
            reference: tag.reference,
            packType: tag.packType,
            type: tag.type,
            status: 'in_stock',
          },
        });
        created.push({ reference: tag.reference, packType: tag.packType });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created.length} tags prêts pour activation`,
      tags: created,
    });
  } catch (error) {
    console.error('[seed-activate] Error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
