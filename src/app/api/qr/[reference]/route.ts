import { NextRequest, NextResponse } from 'next/server';
import { generateQRBuffer } from '@/lib/qr';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await params;
    const { searchParams } = new URL(request.url);
    const size = parseInt(searchParams.get('size') || '200', 10);

    const buffer = await generateQRBuffer({ reference, size });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[QR image] Error:', error);
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 });
  }
}
