import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:');
  for (const u of users) {
    console.log(`- ${u.email} (Role: ${u.role})`);
    const match = await bcrypt.compare('Xtratimeadmin@3456', u.passwordHash);
    console.log(`  Password match for 'Xtratimeadmin@3456'? ${match}`);
  }
}
main().finally(() => prisma.$disconnect());
