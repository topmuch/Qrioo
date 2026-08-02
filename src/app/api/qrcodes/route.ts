import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET : Lister les QR codes (Baggage) ─────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
    const status = searchParams.get('status') || undefined;
    const pack = searchParams.get('pack') || undefined;
    const search = searchParams.get('search') || undefined;

    // Build the where clause
    const where: Record<string, unknown> = {};

    if (status && status !== 'scanned') {
      where.status = status;
    }

    if (pack) {
      where.packType = pack;
    }

    if (search) {
      where.reference = { contains: search, mode: 'insensitive' };
    }

    // Special handling for "scanned" status filter (scanCount > 0)
    if (status === 'scanned') {
      where.scanCount = { gt: 0 };
      delete where.status;
    }

    const skip = (page - 1) * limit;

    const [qrcodes, total] = await Promise.all([
      prisma.baggage.findMany({
        where,
        include: {
          batch: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.baggage.count({ where }),
    ]);

    const formatted = qrcodes.map((qr) => ({
      id: qr.id,
      reference: qr.reference,
      status: qr.status,
      packType: qr.packType,
      scanCount: qr.scanCount,
      createdAt: qr.createdAt,
      lastScanDate: qr.lastScanDate,
      lastScanLocation: qr.lastScanLocation,
      batchName: qr.batch?.name ?? null,
      batchId: qr.batchId,
    }));

    return NextResponse.json({
      qrcodes: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('[qrcodes GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
