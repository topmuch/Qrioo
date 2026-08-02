import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { generateUniqueReference } from '@/lib/qr';

// Demo reset interval: 1 hour
const RESET_INTERVAL_MS = 60 * 60 * 1000;
let lastResetTime: number | null = null;
let nextResetTime: number | null = null;

function setResetTimes() {
  lastResetTime = Date.now();
  nextResetTime = Date.now() + RESET_INTERVAL_MS;
}

// Seed demo data
async function createDemoData() {
  // 1. Agencies
  const agency1 = await prisma.agency.create({
    data: {
      id: 'demo-agency-1',
      name: 'Voyages S\u00e9r\u00e9nit\u00e9',
      slug: 'voyages-serenite',
      email: 'contact@voyages-serenite.com',
      phone: '+33 1 42 68 53 00',
      city: 'Paris',
      country: 'France',
    },
  });

  const agency2 = await prisma.agency.create({
    data: {
      id: 'demo-agency-2',
      name: 'Azur Immo',
      slug: 'azur-immo',
      email: 'contact@azur-immo.com',
      phone: '+33 4 93 16 00 00',
      city: 'Nice',
      country: 'France',
    },
  });

  // 2. Users
  const superadminPw = await hashPassword('admin123');
  await prisma.user.create({
    data: {
      email: 'superadmin@qrioo.com',
      password: superadminPw,
      name: 'Super Admin',
      role: 'SUPERADMIN',
    },
  });

  const adminPw1 = await hashPassword('agence123');
  await prisma.user.create({
    data: {
      email: 'admin@voyages-serenite.com',
      password: adminPw1,
      name: 'Marie Dupont',
      role: 'ADMIN_AGENCE',
      agencyId: agency1.id,
    },
  });

  const adminPw2 = await hashPassword('agence123');
  await prisma.user.create({
    data: {
      email: 'admin@azur-immo.com',
      password: adminPw2,
      name: 'Lucas Martin',
      role: 'ADMIN_AGENCE',
      agencyId: agency2.id,
    },
  });

  // 3. Batches with QR codes
  const batchConfigs = [
    { name: 'Demo Bagages', packType: 'pratique' as const, qty: 8, agencyId: agency1.id },
    { name: 'Demo Messages', packType: 'emotion' as const, qty: 6, agencyId: agency1.id },
    { name: 'Demo \u00c9v\u00e9nement', packType: 'evenementiel' as const, qty: 4, agencyId: agency1.id },
    { name: 'Demo Biens', packType: 'immobilier' as const, qty: 10, agencyId: agency2.id },
    { name: 'Demo Bagages Immo', packType: 'pratique' as const, qty: 6, agencyId: agency2.id },
    { name: 'Demo \u00c9v\u00e9nements Immo', packType: 'evenementiel' as const, qty: 4, agencyId: agency2.id },
  ];

  const allReferences: string[] = [];

  for (const config of batchConfigs) {
    const batch = await prisma.batch.create({
      data: {
        name: config.name,
        packType: config.packType,
        quantity: config.qty,
        agencyId: config.agencyId,
        status: 'generated',
      },
    });

    const references: string[] = [];
    for (let i = 0; i < config.qty; i++) {
      references.push(generateUniqueReference());
    }
    allReferences.push(...references);

    await prisma.baggage.createMany({
      data: references.map((ref) => ({
        reference: ref,
        packType: config.packType,
        status: 'in_stock',
        agencyId: config.agencyId,
        batchId: batch.id,
        scanCount: 0,
      })),
    });
  }

  // 4. Activate some QR codes for realism
  const now = new Date();
  const activatedRefs: string[] = [];

  // Activate Pratique tags
  const pratiqueTags = await prisma.baggage.findMany({ where: { packType: 'pratique' }, take: 3 });
  for (const tag of pratiqueTags) {
    await prisma.baggage.update({
      where: { id: tag.id },
      data: {
        status: 'activated',
        travelerFirstName: 'Jean',
        travelerLastName: 'Dupont',
        whatsappOwner: '+221770000001',
        customData: JSON.stringify({
          category: 'valise', category_label: 'Valise',
          object_name: 'Valise noire Samsonite',
          object_description: 'Valise cabine noire avec ruban rouge',
          brand: 'Samsonite', color: 'Noir',
          city: 'Dakar', country: 'S\u00e9n\u00e9gal',
        }),
        expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    activatedRefs.push(tag.reference);
  }

  // Activate Emotion tags
  const emotionTags = await prisma.baggage.findMany({ where: { packType: 'emotion' }, take: 2 });
  for (const tag of emotionTags) {
    await prisma.baggage.update({
      where: { id: tag.id },
      data: {
        status: 'activated',
        travelerFirstName: 'Aminata',
        travelerLastName: 'Diallo',
        contentType: 'text',
        contentMetadata: JSON.stringify({
          recipientName: 'Cher Ami',
          message: 'Merci pour ces moments inoubliables pass\u00e9s ensemble. Vous comptez \u00e9norm\u00e9ment pour moi !',
        }),
        expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    activatedRefs.push(tag.reference);
  }

  // Activate Evenementiel tag
  const eventTags = await prisma.baggage.findMany({ where: { packType: 'evenementiel' }, take: 1 });
  for (const tag of eventTags) {
    await prisma.baggage.update({
      where: { id: tag.id },
      data: {
        status: 'activated',
        travelerFirstName: 'Fatou',
        travelerLastName: 'Sow',
        contentMetadata: JSON.stringify({
          eventName: 'Mariage Diallo & Ndiaye',
          eventDate: '2025-08-15',
          eventHost: 'Famille Diallo',
          description: 'Vous \u00eates invit\u00e9s au mariage de Aissatou et Mamadou. Une journ\u00e9e de f\u00eate inoubliable vous attend !',
          eventType: 'mariage',
          guestBookEnabled: true,
        }),
        expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.guestMessage.createMany({
      data: [
        { baggageId: tag.id, authorName: 'Omar Ba', content: 'F\u00e9licitations aux futurs mari\u00e9s ! Que Dieu vous b\u00e9nisse.' },
        { baggageId: tag.id, authorName: 'Khady Fall', content: 'Quel beau couple ! Je suis trop heureuse pour vous.' },
        { baggageId: tag.id, authorName: 'Moussa Traor\u00e9', content: 'H\u00e2te d\u00eatre pr\u00e9sent \u00e0 ce grand jour !' },
      ],
    });
    activatedRefs.push(tag.reference);
  }

  // Activate Immobilier tags
  const immoTags = await prisma.baggage.findMany({ where: { packType: 'immobilier' }, take: 2 });
  for (const tag of immoTags) {
    await prisma.baggage.update({
      where: { id: tag.id },
      data: {
        status: 'activated',
        travelerFirstName: 'Azur',
        travelerLastName: 'Immo',
        contentMetadata: JSON.stringify({
          title: 'Appartement F4 Vue Mer',
          type: 'appartement', price: 285000, surface: 95,
          rooms: 4, bedrooms: 2, bathrooms: 1,
          city: 'Nice', address: '12 Promenade des Anglais',
          description: 'Magnifique appartement F4 avec vue mer panoramique. Terrasse de 15m\u00b2, parking privatif.',
          contactName: 'Sophie Laurent',
          contactPhone: '+33 6 12 34 56 78',
          images: [],
        }),
        expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      },
    });
    activatedRefs.push(tag.reference);
  }

  // 5. Fake scan history
  const scanTargets = [...pratiqueTags.slice(0, 2), ...emotionTags.slice(0, 1), ...eventTags.slice(0, 1), ...immoTags.slice(0, 2)];
  const locations = ['Dakar', 'Paris', 'Nice', 'Lyon', 'Abidjan'];

  for (const tag of scanTargets) {
    const numScans = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numScans; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const scanDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      await prisma.scanLog.create({
        data: {
          baggageId: tag.id,
          location: locations[Math.floor(Math.random() * locations.length)],
          finderName: i === 0 ? 'Visiteur Demo' : null,
          createdAt: scanDate,
        },
      });
    }
    await prisma.baggage.update({
      where: { id: tag.id },
      data: {
        scanCount: numScans,
        lastScanDate: new Date(now.getTime() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000),
        lastScanLocation: locations[Math.floor(Math.random() * locations.length)],
      },
    });
  }

  return { totalQRCodes: allReferences.length, activatedCount: activatedRefs.length };
}

// Full reset
async function performReset() {
  const startTime = Date.now();

  await prisma.guestMessage.deleteMany({});
  await prisma.scanLog.deleteMany({});
  await prisma.baggage.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.agency.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});

  const stats = await createDemoData();
  setResetTimes();

  console.log(`[DEMO RESET] Completed in ${Date.now() - startTime}ms \u2014 ${stats.totalQRCodes} QR codes (${stats.activatedCount} activated)`);
  return stats;
}

// Auto-reset scheduler
let resetTimer: ReturnType<typeof setInterval> | null = null;
let isResetting = false;

function scheduleAutoReset() {
  if (resetTimer) return;
  if (nextResetTime === null) setResetTimes();

  resetTimer = setInterval(async () => {
    if (isResetting) return;
    isResetting = true;
    try {
      console.log('[DEMO RESET] Auto-reset triggered (1h interval)');
      await performReset();
    } catch (error) {
      console.error('[DEMO RESET] Auto-reset failed:', error);
    } finally {
      isResetting = false;
    }
  }, RESET_INTERVAL_MS);

  console.log(`[DEMO RESET] Auto-reset scheduled (every ${RESET_INTERVAL_MS / 60000}min)`);
}

// GET: Demo status
export async function GET() {
  try {
    scheduleAutoReset();
    if (nextResetTime === null) setResetTimes();

    const msUntilNext = Math.max(0, nextResetTime - Date.now());
    const minutesUntilNext = Math.ceil(msUntilNext / 60000);

    const [totalQR, activatedQR, totalScans, totalBatches] = await Promise.all([
      prisma.baggage.count(),
      prisma.baggage.count({ where: { status: 'activated' } }),
      prisma.scanLog.count(),
      prisma.batch.count(),
    ]);

    return NextResponse.json({
      mode: 'demo',
      resetIntervalMinutes: RESET_INTERVAL_MS / 60000,
      minutesUntilNextReset: minutesUntilNext,
      nextReset: new Date(nextResetTime).toISOString(),
      lastReset: lastResetTime ? new Date(lastResetTime).toISOString() : null,
      currentData: { totalQR, activatedQR, totalScans, totalBatches },
    });
  } catch (error) {
    console.error('[demo status] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Manual reset
export async function POST() {
  try {
    if (isResetting) {
      return NextResponse.json({ error: 'R\u00e9initialisation en cours...' }, { status: 429 });
    }
    isResetting = true;
    const stats = await performReset();
    isResetting = false;
    return NextResponse.json({ success: true, message: 'D\u00e9mo r\u00e9initialis\u00e9e avec succ\u00e8s', ...stats });
  } catch (error) {
    isResetting = false;
    console.error('[demo reset] Error:', error);
    return NextResponse.json({ error: 'Erreur lors de la r\u00e9initialisation' }, { status: 500 });
  }
}
