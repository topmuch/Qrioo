import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = extractBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { agency: { select: { id: true, name: true, slug: true, city: true, country: true } } },
      select: {
        id: true, email: true, name: true, role: true,
        agencyId: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true,
        agency: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
