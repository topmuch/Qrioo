import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // ─── KPI counts ───
    const [totalTags, totalActivated, totalBatches, totalScans] = await Promise.all([
      prisma.baggage.count(),
      prisma.baggage.count({ where: { status: 'activated' } }),
      prisma.batch.count(),
      prisma.scanLog.count(),
    ]);

    const activationRate = totalTags > 0 ? Math.round((totalActivated / totalTags) * 100) : 0;

    // Tags that belong to batches
    const totalBatchTags = await prisma.baggage.count({ where: { batchId: { not: null } } });

    // ─── Pack breakdown ───
    const packBreakdownRaw = await prisma.baggage.groupBy({
      by: ['packType'],
      _count: true,
    });
    const packBreakdown: Record<string, number> = {};
    for (const row of packBreakdownRaw) {
      packBreakdown[row.packType] = row._count;
    }

    // ─── Daily activity (last 14 days) ───
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Created per day
    const createdPerDay = await prisma.baggage.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fourteenDaysAgo } },
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    // Scanned per day
    const scannedPerDay = await prisma.scanLog.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: fourteenDaysAgo } },
      _count: true,
      orderBy: { createdAt: 'asc' },
    });

    // Build daily activity map
    const dailyMap: Record<string, { created: number; scanned: number }> = {};
    for (let d = 0; d < 14; d++) {
      const date = new Date(fourteenDaysAgo.getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      dailyMap[key] = { created: 0, scanned: 0 };
    }
    for (const row of createdPerDay) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].created = row._count;
    }
    for (const row of scannedPerDay) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].scanned = row._count;
    }
    const dailyActivity = Object.entries(dailyMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // ─── Recent batches (last 5) ───
    const recentBatches = await prisma.batch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { baggages: true } } },
    });

    // ─── Recent scans (last 8) ───
    const recentScans = await prisma.scanLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        baggage: { select: { reference: true, packType: true } },
      },
    });

    return NextResponse.json({
      totalTags,
      totalActivated,
      totalBatches,
      totalScans,
      totalBatchTags,
      activationRate,
      packBreakdown,
      dailyActivity,
      recentBatches: recentBatches.map((b) => ({
        id: b.id,
        name: b.name,
        packType: b.packType,
        tagCount: b._count.baggages,
        createdAt: b.createdAt,
      })),
      recentScans: recentScans.map((s) => ({
        id: s.id,
        reference: s.baggage.reference,
        packType: s.baggage.packType,
        location: s.location || s.city,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error('[dashboard] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
