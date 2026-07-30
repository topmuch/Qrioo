/**
 * QR Code generation helper
 * Uses the `qrcode` package (server-side only)
 */

let _qrModule: typeof import('qrcode') | null = null;

async function getQR() {
  if (!_qrModule) {
    _qrModule = await import('qrcode');
  }
  return _qrModule;
}

export interface GenerateQROptions {
  reference: string;
  packType?: string;
  baseUrl?: string;
  size?: number;
}

/**
 * Generate a QR code as a data URL (for embedding in HTML)
 */
export async function generateQRDataUrl(options: GenerateQROptions): Promise<string> {
  const {
    reference,
    packType = 'pratique',
    baseUrl = 'https://qrioo.com',
    size = 200,
  } = options;

  const scanUrl = `${baseUrl}/scan/${reference}`;
  const QR = await getQR();

  return QR.toDataURL(scanUrl, {
    type: 'image/png',
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

/**
 * Generate a QR code as a Buffer (for PDF/ZIP export)
 */
export async function generateQRBuffer(options: GenerateQROptions): Promise<Buffer> {
  const {
    reference,
    baseUrl = 'https://qrioo.com',
    size = 400,
  } = options;

  const scanUrl = `${baseUrl}/scan/${reference}`;
  const QR = await getQR();

  return QR.toBuffer(scanUrl, {
    type: 'png',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
  });
}

/**
 * Generate unique reference code for a baggage tag.
 * Format: QROO-YY-XXXXXX (6 alphanumeric chars, unambiguous)
 */
export function generateUniqueReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const year = new Date().getFullYear().toString().slice(-2);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `QROO-${year}-${code}`;
}

/** Color mapping per pack type */
export const PACK_COLORS: Record<string, { dark: string; label: string; bg: string }> = {
  pratique: { dark: '#D97706', label: '#92400E', bg: '#FFFBEB' },
  emotion: { dark: '#7C3AED', label: '#5B21B6', bg: '#FAF5FF' },
  evenementiel: { dark: '#059669', label: '#064E3B', bg: '#ECFDF5' },
  immobilier: { dark: '#475569', label: '#1E293B', bg: '#F8FAFC' },
};
