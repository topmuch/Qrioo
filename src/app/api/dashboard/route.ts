import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const packFilter = searchParams.get('pack');

    const where = packFilter && packFilter !== 'all'
      ? { packType: packFilter } as const
      : undefined;

    // ─── KPI counts ───
    const [totalTags, totalActivated, totalBatches, totalScans] = await Promise.all([
      prisma.baggage.count({ where }),
      prisma.baggage.count({ where: { ...where, status: 'activated' } }),
      prisma.batch.count(),
      prisma.scanLog.count(),
    ]);

    const activationRate = totalTags > 0 ? Math.round((totalActivated / totalTags) * 100) : 0;

    // Tags that belong to batches
    const totalBatchTags = await prisma.baggage.count({
      where: { batchId: { not: null }, ...where },
    });

    // ─── Pack breakdown ───
    const packBreakdownRaw = await prisma.baggage.groupBy({
      by: ['packType'],
      _count: true,
    });
    const packBreakdown: Record<string, number> = {};
    for (const row of packBreakdownRaw) {
      packBreakdown[row.packType] = row._count;
    }

    // ─── Status distribution ───
    const statusRaw = await prisma.baggage.groupBy({
      by: ['status'],
      _count: true,
    });
    const statusBreakdown: Record<string, number> = {};
    for (const row of statusRaw) {
      statusBreakdown[row.status] = row._count;
    }

    // ─── Daily activity (last 14 days) — manual aggregation for SQLite compat ───
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [recentBaggages, recentScans] = await Promise.all([
      prisma.baggage.findMany({
        where: { createdAt: { gte: fourteenDaysAgo }, ...where },
        select: { createdAt: true },
      }),
      prisma.scanLog.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    const dailyMap: Record<string, { created: number; scanned: number }> = {};
    for (let d = 0; d < 14; d++) {
      const date = new Date(fourteenDaysAgo.getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().slice(0, 10);
      dailyMap[key] = { created: 0, scanned: 0 };
    }
    for (const b of recentBaggages) {
      const key = b.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].created++;
    }
    for (const s of recentScans) {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) dailyMap[key].scanned++;
    }
    const dailyActivity = Object.entries(dailyMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));

    // ─── Recent batches (last 8) with status counts ───
    const recentBatches = await prisma.batch.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { baggages: true } } },
    });

    // ─── Recent scans (last 10) ───
    const recentScansList = await prisma.scanLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        baggage: { select: { reference: true, packType: true, status: true } },
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
      statusBreakdown,
      dailyActivity,
      recentBatches: recentBatches.map((b) => ({
        id: b.id,
        name: b.name,
        packType: b.packType,
        tagCount: b._count.baggages,
        status: b.status,
        createdAt: b.createdAt,
      })),
      recentScans: recentScansList.map((s) => ({
        id: s.id,
        reference: s.baggage.reference,
        packType: s.baggage.packType,
        tagStatus: s.baggage.status,
        location: s.location || s.city,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error('[dashboard] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
