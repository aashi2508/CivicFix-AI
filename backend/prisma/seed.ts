import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@civicfix.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error('Set ADMIN_PASSWORD in backend .env (minimum 8 characters).');
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'CivicFix Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    },
    create: {
      email: adminEmail,
      name: 'CivicFix Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const citizenEmail = (process.env.SEED_CITIZEN_EMAIL ?? 'citizen@example.test').toLowerCase();
  const citizenPassword = process.env.SEED_CITIZEN_PASSWORD ?? 'ChangeMe123!';
  const citizenPasswordHash = await bcrypt.hash(citizenPassword, 12);
  const citizen = await prisma.user.upsert({
    where: { email: citizenEmail },
    update: {},
    create: {
      email: citizenEmail,
      name: 'Demo Citizen',
      passwordHash: citizenPasswordHash,
      role: Role.CITIZEN
    }
  });

  console.log(`Admin account ready: ${admin.email}`);
  console.log(`Demo citizen account ready: ${citizen.email}`);
  console.log('Do not use development credentials in production.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
