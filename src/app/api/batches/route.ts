import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateUniqueReference } from '@/lib/qr';

const createBatchSchema = z.object({
  name: z.string().min(1, 'Nom du lot requis').max(100),
  packType: z.enum(['pratique', 'emotion', 'evenementiel', 'immobilier']),
  quantity: z.number().int().min(1).max(500, 'Quantité entre 1 et 500'),
});

// ─── GET : Lister les batches ──────────────────────────────────

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      include: {
        _count: { select: { baggages: true } },
        agency: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const enriched = await Promise.all(
      batches.map(async (batch) => {
        const stats = await prisma.baggage.groupBy({
          by: ['status'],
          where: { batchId: batch.id },
          _count: true,
        });
        const statusCounts: Record<string, number> = {};
        for (const s of stats) {
          statusCounts[s.status] = s._count;
        }
        return {
          id: batch.id,
          name: batch.name,
          packType: batch.packType,
          quantity: batch.quantity,
          status: batch.status,
          createdAt: batch.createdAt,
          agency: batch.agency,
          tagCount: batch._count.baggages,
          statusCounts,
        };
      }),
    );

    return NextResponse.json({ batches: enriched });
  } catch (error) {
    console.error('[batches GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// ─── POST : Créer un batch + générer les tags ───────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createBatchSchema.parse(body);

    // 1. Create batch
    const batch = await prisma.batch.create({
      data: {
        name: data.name,
        packType: data.packType,
        quantity: data.quantity,
        status: 'generated',
      },
    });

    // 2. Generate unique references and create baggage tags
    const references: string[] = [];
    for (let i = 0; i < data.quantity; i++) {
      let ref = generateUniqueReference();
    
      // Ensure uniqueness (retry up to 5 times per ref)
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await prisma.baggage.findUnique({
          where: { reference: ref },
          select: { id: true },
        });
        if (!exists) break;
        ref = generateUniqueReference();
      }

      references.push(ref);
      await prisma.baggage.create({
        data: {
          reference: ref,
          packType: data.packType,
          type: data.packType,
          status: 'in_stock',
          batchId: batch.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Lot «${data.name}» créé avec ${data.quantity} tags`,
      batch: {
        id: batch.id,
        name: batch.name,
        packType: batch.packType,
        quantity: batch.quantity,
        references,
      },
    });
  } catch (error) {
    console.error('[batches POST] Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erreur de validation', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
