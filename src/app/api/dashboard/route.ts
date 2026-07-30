import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractBearerToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const token = extractBearerToken(request);
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const packFilter = searchParams.get('pack');

    // Build base WHERE clause
    const baseAgencyFilter = payload.role === 'ADMIN_AGENCE' && payload.agencyId
      ? { agencyId: payload.agencyId }
      : {};

    const where = {
      ...baseAgencyFilter,
      ...(packFilter && packFilter !== 'all' ? { packType: packFilter } : {}),
    };

    // KPI counts
    const [totalTags, totalActivated, totalBatches, totalScans, totalAgencies, totalUsers] = await Promise.all([
      prisma.baggage.count({ where }),
      prisma.baggage.count({ where: { ...where, status: 'activated' } }),
      prisma.batch.count({ where: baseAgencyFilter }),
      prisma.scanLog.count({
        where: payload.role === 'ADMIN_AGENCE' && payload.agencyId
          ? { baggage: { agencyId: payload.agencyId } }
          : {},
      }),
      payload.role === 'SUPERADMIN' ? prisma.agency.count() : Promise.resolve(0),
      payload.role === 'SUPERADMIN' ? prisma.user.count() : Promise.resolve(0),
    ]);

    const activationRate = totalTags > 0 ? Math.round((totalActivated / totalTags) * 100) : 0;

    const totalBatchTags = await prisma.baggage.count({
      where: { batchId: { not: null }, ...where },
    });

    // Pack breakdown
    const packBreakdownRaw = await prisma.baggage.groupBy({
      by: ['packType'],
      _count: true,
      where: baseAgencyFilter,
    });
    const packBreakdown: Record<string, number> = {};
    for (const row of packBreakdownRaw) {
      packBreakdown[row.packType] = row._count;
    }

    // Status distribution
    const statusRaw = await prisma.baggage.groupBy({
      by: ['status'],
      _count: true,
      where: baseAgencyFilter,
    });
    const statusBreakdown: Record<string, number> = {};
    for (const row of statusRaw) {
      statusBreakdown[row.status] = row._count;
    }

    // Daily activity (last 14 days)
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const [recentBaggages, recentScans] = await Promise.all([
      prisma.baggage.findMany({
        where: { createdAt: { gte: fourteenDaysAgo }, ...where },
        select: { createdAt: true },
      }),
      prisma.scanLog.findMany({
        where: {
          createdAt: { gte: fourteenDaysAgo },
          ...(payload.role === 'ADMIN_AGENCE' && payload.agencyId
            ? { baggage: { agencyId: payload.agencyId } }
            : {}),
        },
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
    const dailyActivity = Object.entries(dailyMap).map(([date, counts]) => ({ date, ...counts }));

    // Recent batches
    const recentBatches = await prisma.batch.findMany({
      where: baseAgencyFilter,
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { baggages: true } }, agency: { select: { name: true } } },
    });

    // Recent scans
    const recentScansList = await prisma.scanLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: payload.role === 'ADMIN_AGENCE' && payload.agencyId
        ? { baggage: { agencyId: payload.agencyId } }
        : {},
      include: {
        baggage: { select: { reference: true, packType: true, status: true } },
      },
    });

    // Agencies list (superadmin only)
    let agencies = null;
    if (payload.role === 'SUPERADMIN') {
      const agenciesRaw = await prisma.agency.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { baggages: true, batches: true, users: true } },
        },
      });
      agencies = agenciesRaw.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        city: a.city,
        country: a.country,
        email: a.email,
        phone: a.phone,
        status: a.status,
        tagCount: a._count.baggages,
        batchCount: a._count.batches,
        userCount: a._count.users,
        createdAt: a.createdAt,
      }));
    }

    return NextResponse.json({
      totalTags,
      totalActivated,
      totalBatches,
      totalScans,
      totalBatchTags,
      activationRate,
      totalAgencies,
      totalUsers,
      packBreakdown,
      statusBreakdown,
      dailyActivity,
      recentBatches: recentBatches.map((b) => ({
        id: b.id,
        name: b.name,
        packType: b.packType,
        tagCount: b._count.baggages,
        status: b.status,
        agencyName: b.agency?.name || null,
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
      agencies,
    });
  } catch (error) {
    console.error('[dashboard] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
