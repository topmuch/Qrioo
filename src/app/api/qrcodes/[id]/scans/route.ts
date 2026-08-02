import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── GET : Scan logs for a specific QR code ──────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const scans = await prisma.scanLog.findMany({
      where: { baggageId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        location: true,
        message: true,
        finderName: true,
        finderPhone: true,
        createdAt: true,
        context: true,
      },
    });

    return NextResponse.json({ scans });
  } catch (error) {
    console.error('[qrcodes scans GET] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
