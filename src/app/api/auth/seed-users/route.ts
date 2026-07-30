import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    const agency = await prisma.agency.upsert({
      where: { id: 'demo-agency-1' },
      update: {},
      create: {
        id: 'demo-agency-1',
        name: 'Voyages Sérénité',
        slug: 'voyages-serenite',
        email: 'contact@voyages-serenite.com',
        phone: '+33 1 42 68 53 00',
        city: 'Paris',
        country: 'France',
      },
    });

    const agency2 = await prisma.agency.upsert({
      where: { id: 'demo-agency-2' },
      update: {},
      create: {
        id: 'demo-agency-2',
        name: 'Azur Immo',
        slug: 'azur-immo',
        email: 'contact@azur-immo.com',
        phone: '+33 4 93 16 00 00',
        city: 'Nice',
        country: 'France',
      },
    });

    const superadminPw = await hashPassword('admin123');
    await prisma.user.upsert({
      where: { email: 'superadmin@qrioo.com' },
      update: { password: superadminPw, role: 'SUPERADMIN', agencyId: null },
      create: {
        email: 'superadmin@qrioo.com',
        password: superadminPw,
        name: 'Super Admin',
        role: 'SUPERADMIN',
        agencyId: null,
      },
    });

    const adminPw1 = await hashPassword('agence123');
    await prisma.user.upsert({
      where: { email: 'admin@voyages-serenite.com' },
      update: { password: adminPw1, agencyId: agency.id },
      create: {
        email: 'admin@voyages-serenite.com',
        password: adminPw1,
        name: 'Marie Dupont',
        role: 'ADMIN_AGENCE',
        agencyId: agency.id,
      },
    });

    const adminPw2 = await hashPassword('agence123');
    await prisma.user.upsert({
      where: { email: 'admin@azur-immo.com' },
      update: { password: adminPw2, agencyId: agency2.id },
      create: {
        email: 'admin@azur-immo.com',
        password: adminPw2,
        name: 'Lucas Martin',
        role: 'ADMIN_AGENCE',
        agencyId: agency2.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateurs de démonstration créés',
      accounts: [
        { email: 'superadmin@qrioo.com', password: 'admin123', role: 'SUPERADMIN' },
        { email: 'admin@voyages-serenite.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Voyages Sérénité' },
        { email: 'admin@azur-immo.com', password: 'agence123', role: 'ADMIN_AGENCE', agency: 'Azur Immo' },
      ],
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erreur lors du seed' }, { status: 500 });
  }
}
