import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSellers() {
  console.log('Seeding test sellers...');

  const testSellers = [
    {
      email: 'kumar.textiles@example.com',
      password: 'Seller123!',
      companyName: 'Kumar Textiles Pvt Ltd',
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      businessType: 'Manufacturing',
      address: '123 Industrial Area, Phase 2',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      contactName: 'Rajesh Kumar',
      contactPhone: '9876543210',
    },
    {
      email: 'steel.corp@example.com',
      password: 'Seller123!',
      companyName: 'Steel Corp India',
      gstin: '29GGGGG1314R9Z6',
      pan: 'GGGGG1314R',
      businessType: 'Manufacturing',
      address: '456 Steel Nagar',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      contactName: 'Suresh Patel',
      contactPhone: '9876543211',
    },
    {
      email: 'auto.parts@example.com',
      password: 'Seller123!',
      companyName: 'Auto Parts Ltd',
      gstin: '33AABCT1332L1ZZ',
      pan: 'AABCT1332L',
      businessType: 'Trading',
      address: '789 Auto Hub',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      contactName: 'Venkat Raman',
      contactPhone: '9876543212',
    },
    {
      email: 'fabric.house@example.com',
      password: 'Seller123!',
      companyName: 'Fabric House',
      gstin: '27AAAAA0000A1Z5',
      pan: 'AAAAA0000A',
      businessType: 'Retail',
      address: '101 Textile Market',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395001',
      contactName: 'Amit Shah',
      contactPhone: '9876543213',
    },
    {
      email: 'electronics.world@example.com',
      password: 'Seller123!',
      companyName: 'Electronics World',
      gstin: '07BBBBB2222B2Z2',
      pan: 'BBBBB2222B',
      businessType: 'Trading',
      address: '222 Electronics Hub',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      contactName: 'Priya Sharma',
      contactPhone: '9876543214',
    },
  ];

  for (const seller of testSellers) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: seller.email },
    });

    if (existing) {
      console.log(`Seller ${seller.email} already exists, skipping...`);
      continue;
    }

    // Create user and seller
    const passwordHash = await bcrypt.hash(seller.password, 12);

    const user = await prisma.user.create({
      data: {
        email: seller.email,
        passwordHash,
        userType: 'SELLER',
        status: 'ACTIVE',
        seller: {
          create: {
            companyName: seller.companyName,
            gstin: seller.gstin,
            pan: seller.pan,
            businessType: seller.businessType,
            address: seller.address,
            city: seller.city,
            state: seller.state,
            pincode: seller.pincode,
            contactName: seller.contactName,
            contactPhone: seller.contactPhone,
            kycStatus: 'APPROVED', // Set as approved for demo
          },
        },
      },
      include: {
        seller: true,
      },
    });

    console.log(`Created seller: ${seller.companyName} (${seller.email})`);
  }

  console.log('Seller seeding complete!');
}

seedSellers()
  .catch((e) => {
    console.error('Error seeding sellers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
