import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, signToken, type JWTPayload } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const DEMO_USERS = [
  { email: 'superadmin@qrioo.com', password: 'admin123', name: 'Super Admin', role: 'SUPERADMIN' as const, agencyId: null },
  { email: 'admin@voyages-serenite.com', password: 'agence123', name: 'Marie Dupont', role: 'ADMIN_AGENCE' as const, agencySlug: 'voyages-serenite' },
  { email: 'admin@azur-immo.com', password: 'agence123', name: 'Lucas Martin', role: 'ADMIN_AGENCE' as const, agencySlug: 'azur-immo' },
];

const DEMO_AGENCIES = [
  { id: 'demo-agency-1', name: 'Voyages Sérénité', slug: 'voyages-serenite', email: 'contact@voyages-serenite.com', phone: '+33 1 42 68 53 00', city: 'Paris', country: 'France' },
  { id: 'demo-agency-2', name: 'Azur Immo', slug: 'azur-immo', email: 'contact@azur-immo.com', phone: '+33 4 93 16 00 00', city: 'Nice', country: 'France' },
];

async function ensureDemoUsers() {
  const count = await prisma.user.count().catch(() => 0);
  if (count > 0) return;

  console.log('[seed] No users found, creating demo accounts...');

  for (const agency of DEMO_AGENCIES) {
    await prisma.agency.upsert({ where: { id: agency.id }, update: {}, create: agency }).catch(() => {});
  }

  for (const demo of DEMO_USERS) {
    const hashed = await hashPassword(demo.password);
    let agencyId: string | null = null;

    if (demo.agencySlug) {
      const agency = await prisma.agency.findUnique({ where: { slug: demo.agencySlug } });
      if (agency) agencyId = agency.id;
    }

    await prisma.user.upsert({
      where: { email: demo.email },
      update: { password: hashed },
      create: { email: demo.email, password: hashed, name: demo.name, role: demo.role, agencyId },
    }).catch(() => {});
  }

  console.log('[seed] Demo accounts created.');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    // Auto-seed if no users exist
    await ensureDemoUsers();

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      include: { agency: { select: { id: true, name: true, slug: true, city: true, country: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    }

    const valid = await verifyPassword(parsed.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'SUPERADMIN' | 'ADMIN_AGENCE',
      agencyId: user.agencyId,
    };

    const token = await signToken(payload);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId,
        agency: user.agency,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
