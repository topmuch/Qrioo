import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        baggages: {
          select: {
            reference: true,
            packType: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Lot introuvable' }, { status: 404 });
    }

    const tags = batch.baggages;
    if (tags.length === 0) {
      return NextResponse.json({ error: 'Aucun tag dans ce lot' }, { status: 400 });
    }

    // Build CSV with BOM for Excel compatibility
    const BOM = '\uFEFF';
    const header = 'Reference;Pack Type;Statut;Date Creation;URL Scan\n';
    const rows = tags
      .map((tag) => {
        const date = tag.createdAt.toISOString().slice(0, 10);
        const url = `https://qrioo.com/scan/${tag.reference}`;
        return `${tag.reference};${tag.packType};${tag.status};${date};${url}`;
      })
      .join('\n');

    const csv = BOM + header + rows;

    const filename = `qrioo-${batch.name.replace(/\s+/g, '-')}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error('[batch CSV] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
