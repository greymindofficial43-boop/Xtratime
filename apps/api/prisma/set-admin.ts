import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Change the admin login on an already-seeded database without re-seeding.
 * Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME from env.
 *
 * Updates the EXISTING admin record (the default one, or the first ADMIN) so
 * article authorship stays intact; creates one only if none exists. The old
 * default `admin@sportskeeda.local` login stops working once changed.
 *
 *   set -a && . ./.env.bn && set +a && npm run set-admin
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Site Admin';

  if (!email || !password) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existing =
    (await prisma.user.findUnique({ where: { email: 'admin@sportskeeda.local' } })) ??
    (await prisma.user.findFirst({ where: { role: UserRole.ADMIN }, orderBy: { createdAt: 'asc' } }));

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, passwordHash, name, role: UserRole.ADMIN },
    });
    console.log(`Updated admin login -> ${email}`);
  } else {
    await prisma.user.create({
      data: { email, passwordHash, name, role: UserRole.ADMIN },
    });
    console.log(`Created admin login -> ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
