import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQRBuffer, PACK_COLORS } from '@/lib/qr';

const QR_PER_ROW = 4;
const QR_PER_COL = 4;
const QR_PER_PAGE = QR_PER_ROW * QR_PER_COL; // 16

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

    // Dynamically import jspdf (server-side only)
    const { jsPDF } = await import('jspdf');

    // A4 dimensions in mm
    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 12;
    const HEADER_H = 18;
    const FOOTER_H = 10;
    const CONTENT_TOP = MARGIN + HEADER_H;
    const CONTENT_H = PAGE_H - CONTENT_TOP - MARGIN - FOOTER_H;

    const contentW = PAGE_W - 2 * MARGIN;
    const cellW = contentW / QR_PER_ROW;
    const cellH = CONTENT_H / QR_PER_COL;
    const qrSize = Math.min(cellW, cellH) * 0.52;

    // Generate QR buffers
    const qrBuffers = await Promise.all(
      tags.map((tag) => generateQRBuffer({ reference: tag.reference, packType: batch.packType, size: Math.round(qrSize * 3.78) }))
    );

    // Convert hex to RGB
    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '');
      return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
    }

    const [accentR, accentG, accentB] = hexToRgb(colors.dark);
    const totalPages = Math.ceil(tags.length / QR_PER_PAGE);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage();

      const startIdx = p * QR_PER_PAGE;
      const pageTags = tags.slice(startIdx, startIdx + QR_PER_PAGE);

      // ─── Header ───
      doc.setFillColor(accentR, accentG, accentB);
      doc.rect(0, 0, PAGE_W, HEADER_H + MARGIN, 'F');

      // White title text on colored bar
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(batch.name, MARGIN, MARGIN + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${packLabel}`, MARGIN, MARGIN + 12);

      // Page info (right aligned)
      doc.setFontSize(8);
      doc.text(
        `Page ${p + 1}/${totalPages}  |  ${tags.length} QR codes`,
        PAGE_W - MARGIN, MARGIN + 9,
        { align: 'right' }
      );

      // Qrioo branding
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text('Qrioo', PAGE_W - MARGIN, MARGIN + 14, { align: 'right' });

      // ─── Grid cells ───
      for (let i = 0; i < pageTags.length; i++) {
        const col = i % QR_PER_ROW;
        const row = Math.floor(i / QR_PER_ROW);
        const tag = pageTags[i];
        const qrBuf = qrBuffers[startIdx + i];

        const cellX = MARGIN + col * cellW;
        const cellY = CONTENT_TOP + row * cellH;
        const centerX = cellX + cellW / 2;

        // Cell border (subtle)
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.roundedRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2, 2, 2, 'S');

        // QR code image
        const qrBase64 = `data:image/png;base64,${qrBuf.toString('base64')}`;
        const qrX = centerX - qrSize / 2;
        const qrY = cellY + (cellH - qrSize) / 2 - 3;
        doc.addImage(qrBase64, 'PNG', qrX, qrY, qrSize, qrSize);

        // Reference text
        doc.setTextColor(accentR, accentG, accentB);
        doc.setFontSize(7.5);
        doc.setFont('courier', 'bold');
        doc.text(tag.reference, centerX, qrY + qrSize + 4.5, { align: 'center' });

        // Status badge
        const statusText = tag.status === 'activated' ? 'Active' : 'En stock';
        const badgeW = doc.getTextWidth(statusText) + 6;
        const badgeX = centerX - badgeW / 2;
        const badgeY = qrY + qrSize + 5.5;

        if (tag.status === 'activated') {
          doc.setFillColor(220, 252, 231);
          doc.setTextColor(21, 128, 61);
        } else {
          doc.setFillColor(254, 243, 199);
          doc.setTextColor(146, 64, 14);
        }
        doc.roundedRect(badgeX, badgeY, badgeW, 4, 1.5, 1.5, 'F');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(statusText, centerX, badgeY + 3, { align: 'center' });
      }

      // ─── Footer ───
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      const dateStr = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      doc.text(`Genere le ${dateStr}  |  qrioo.com  |  Lot: ${batch.id}`, PAGE_W / 2, PAGE_H - 4, { align: 'center' });
    }

    const pdfBytes = doc.output('arraybuffer');
    const filename = `qrioo-${batch.name.replace(/\s+/g, '-')}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': String(pdfBytes.byteLength),
      },
    });
  } catch (error) {
    console.error('[batch PDF] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
