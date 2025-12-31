import { prisma } from '../../../config/database';

/**
 * Generate a sequential contract number in format CON-XXXX
 * Example: CON-0001, CON-0002, etc.
 */
export async function generateContractNumber(): Promise<string> {
  // Get the latest contract number
  const latestContract = await prisma.contract.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { contractNumber: true },
  });

  let nextNumber = 1;

  if (latestContract?.contractNumber) {
    // Extract the number from CON-XXXX format
    const match = latestContract.contractNumber.match(/CON-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Format with leading zeros (4 digits)
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `CON-${paddedNumber}`;
}
