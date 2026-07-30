import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRDataUrl, PACK_COLORS } from '@/lib/qr';

const QR_PER_ROW = 4;
const QR_PER_PAGE = 16; // 4x4 grid on A4
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const QR_SIZE = 140;
const CELL_W = A4_WIDTH_PX / QR_PER_ROW;
const CELL_H = A4_HEIGHT_PX / 4;

const PACK_LABELS: Record<string, string> = {
  pratique: 'Pack Pratique',
  emotion: 'Pack Emotion',
  evenementiel: 'Pack Evenementiel',
  immobilier: 'Pack Immobilier',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        agency: { select: { name: true } },
        baggages: {
          select: { reference: true, status: true, packType: true },
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

    const colors = PACK_COLORS[batch.packType] || PACK_COLORS.pratique;
    const packLabel = PACK_LABELS[batch.packType] || batch.packType;

    // Generate QR data URLs for all tags
    const qrDataUrls = await Promise.all(
      tags.map((tag) => generateQRDataUrl({ reference: tag.reference, packType: batch.packType, size: QR_SIZE }))
    );

    // Build HTML pages (A4 printable)
    const pages: string[] = [];
    const totalPages = Math.ceil(tags.length / QR_PER_PAGE);

    for (let p = 0; p < totalPages; p++) {
      const startIdx = p * QR_PER_PAGE;
      const pageTags = tags.slice(startIdx, startIdx + QR_PER_PAGE);
      const pageQrs = qrDataUrls.slice(startIdx, startIdx + QR_PER_PAGE);

      let cellsHtml = '';
      for (let i = 0; i < pageTags.length; i++) {
        const col = i % QR_PER_ROW;
        const row = Math.floor(i / QR_PER_ROW);
        const x = col * CELL_W;
        const y = row * CELL_H;
        const tag = pageTags[i];
        const qr = pageQrs[i];
        const ref = tag.reference;
        const statusLabel = tag.status === 'activated' ? 'Activé' : 'En stock';
        const statusBg = tag.status === 'activated' ? '#DCFCE7' : '#FEF3C7';

        cellsHtml += `
          <div style="position:absolute;left:${x}px;top:${y}px;width:${CELL_W}px;height:${CELL_H}px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;">
            <div style="width:${QR_SIZE}px;height:${QR_SIZE}px;border-radius:8px;overflow:hidden;border:2px solid ${colors.dark};box-shadow:0 2px 8px rgba(0,0,0,0.1);">
              <img src="${qr}" width="${QR_SIZE}" height="${QR_SIZE}" style="display:block;" />
            </div>
            <p style="font-family:monospace;font-size:11px;font-weight:bold;color:${colors.dark};margin:6px 0 2px;">${ref}</p>
            <span style="font-size:9px;padding:2px 8px;border-radius:10px;background:${statusBg};color:${colors.dark};font-weight:600;">${statusLabel}</span>
          </div>`;
      }

      pages.push(`
        <div style="width:${A4_WIDTH_PX}px;height:${A4_HEIGHT_PX}px;position:relative;page-break-after:always;box-sizing:border-box;padding:30px;">
          ${cellsHtml}
        </div>`);
    }

    const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${batch.name} - Qrioo</title>
<style>
  @page { size: A4; margin: 0; }
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
</style></head>
<body>
  <div style="padding:20px;font-size:11px;color:#666;display:flex;justify-content:space-between;">
    <span><strong>${batch.name}</strong> — ${packLabel}</span>
    <span>Qrioo — ${new Date().toLocaleDateString('fr-FR')}</span>
    <span>${tags.length} QR codes — Page 1/${totalPages}</span>
  </div>
  ${pages.join('\n')}
</body></html>`;

    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="qrioo-${batch.name.replace(/\s+/g, '-')}.html"`,
      },
    });
  } catch (error) {
    console.error('[batch PDF] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
