import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tags = await prisma.baggage.findMany({
      where: { batchId: id },
      select: { reference: true, status: true, packType: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('[batch tags] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
