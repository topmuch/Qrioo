import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractBearerToken, verifyToken } from '@/lib/auth';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const token = extractBearerToken(request);
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const agencies = await prisma.agency.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { baggages: true, batches: true, users: true } },
    },
  });

  return NextResponse.json({
    agencies: agencies.map((a) => ({
      id: a.id, name: a.name, slug: a.slug, city: a.city, country: a.country,
      email: a.email, phone: a.phone, status: a.status,
      tagCount: a._count.baggages, batchCount: a._count.batches, userCount: a._count.users,
      createdAt: a.createdAt,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const token = extractBearerToken(request);
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.parse(body);

    const slug = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const agency = await prisma.agency.create({
      data: {
        name: parsed.name,
        slug,
        email: parsed.email || null,
        phone: parsed.phone || null,
        city: parsed.city || null,
        country: parsed.country || null,
      },
    });

    return NextResponse.json({ success: true, agency });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
