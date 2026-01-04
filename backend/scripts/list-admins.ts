/**
 * Script to list all admin users
 *
 * Usage:
 *   npx ts-node scripts/list-admins.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { userType: 'ADMIN' },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (admins.length === 0) {
      console.log('No admin users found.');
      return;
    }

    console.log(`Found ${admins.length} admin user(s):\n`);
    console.log('ID                                   | Email                          | Status  | Created');
    console.log('-'.repeat(100));

    for (const admin of admins) {
      const created = admin.createdAt.toISOString().split('T')[0];
      console.log(
        `${admin.id} | ${admin.email.padEnd(30)} | ${admin.status.padEnd(7)} | ${created}`
      );
    }
  } catch (error) {
    console.error('Error listing admins:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
