/**
 * Script to create admin users
 *
 * Usage:
 *   npx ts-node scripts/create-admin.ts <email> <password>
 *
 * Example:
 *   npx ts-node scripts/create-admin.ts admin@company.com SecurePass123!
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin(email: string, password: string) {
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('Error: Invalid email format');
    process.exit(1);
  }

  // Validate password
  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        userType: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    console.log('Admin user created successfully!');
    console.log('----------------------------');
    console.log(`ID: ${admin.id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Type: ${admin.userType}`);
    console.log(`Status: ${admin.status}`);
    console.log('----------------------------');
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npx ts-node scripts/create-admin.ts <email> <password>');
  console.log('Example: npx ts-node scripts/create-admin.ts admin@company.com SecurePass123!');
  process.exit(1);
}

const [email, password] = args;
createAdmin(email, password);
