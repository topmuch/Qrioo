const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if users already exist
    const count = await prisma.user.count();
    if (count > 0) {
      console.log('Users already exist (' + count + '), skipping seed.');
      return;
    }

    // Create agencies
    const agency1 = await prisma.agency.upsert({
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

    // Create users
    const superadminPw = await bcrypt.hash('admin123', 10);
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

    const adminPw1 = await bcrypt.hash('agence123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@voyages-serenite.com' },
      update: { password: adminPw1, agencyId: agency1.id },
      create: {
        email: 'admin@voyages-serenite.com',
        password: adminPw1,
        name: 'Marie Dupont',
        role: 'ADMIN_AGENCE',
        agencyId: agency1.id,
      },
    });

    const adminPw2 = await bcrypt.hash('agence123', 10);
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

    console.log('Seed complete. Accounts created:');
    console.log('  superadmin@qrioo.com / admin123 (SUPERADMIN)');
    console.log('  admin@voyages-serenite.com / agence123 (ADMIN_AGENCE)');
    console.log('  admin@azur-immo.com / agence123 (ADMIN_AGENCE)');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
