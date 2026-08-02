import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET : Single QR code full details ─────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const baggage = await prisma.baggage.findUnique({
      where: { id },
      include: {
        batch: {
          select: { name: true },
        },
        scanLogs: {
          take: 50,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!baggage) {
      return NextResponse.json({ error: 'QR code non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ baggage });
  } catch (error) {
    console.error('[qrcodes id GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
