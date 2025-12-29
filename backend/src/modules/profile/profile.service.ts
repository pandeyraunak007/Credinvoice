import { UserType, EntityType } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  UpdateBuyerProfileInput,
  UpdateSellerProfileInput,
  UpdateFinancierProfileInput,
  AddBankAccountInput,
  UpdateBankAccountInput,
} from './profile.validation';

export class ProfileService {
  // Get full profile based on user type
  async getProfile(userId: string, userType: UserType) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        userType: true,
        status: true,
        twoFactorEnabled: true,
        createdAt: true,
        buyer: userType === 'BUYER' ? {
          include: {
            bankAccounts: true,
            kycDocuments: {
              select: {
                id: true,
                documentType: true,
                status: true,
                createdAt: true,
              },
            },
          },
        } : false,
        seller: userType === 'SELLER' ? {
          include: {
            bankAccounts: true,
            kycDocuments: {
              select: {
                id: true,
                documentType: true,
                status: true,
                createdAt: true,
              },
            },
          },
        } : false,
        financier: userType === 'FINANCIER' ? {
          include: {
            bankAccounts: true,
            kycDocuments: {
              select: {
                id: true,
                documentType: true,
                status: true,
                createdAt: true,
              },
            },
          },
        } : false,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Update Buyer profile
  async updateBuyerProfile(userId: string, data: UpdateBuyerProfileInput) {
    const buyer = await prisma.buyer.findUnique({
      where: { userId },
    });

    if (!buyer) {
      throw new AppError('Buyer profile not found', 404);
    }

    // Check GSTIN uniqueness if being updated
    if (data.gstin && data.gstin !== buyer.gstin) {
      const existing = await prisma.buyer.findUnique({
        where: { gstin: data.gstin },
      });
      if (existing) {
        throw new AppError('GSTIN already registered', 409);
      }
    }

    const updated = await prisma.buyer.update({
      where: { userId },
      data: {
        companyName: data.companyName,
        gstin: data.gstin,
        pan: data.pan,
        industry: data.industry,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
      },
      include: {
        bankAccounts: true,
      },
    });

    return updated;
  }

  // Update Seller profile
  async updateSellerProfile(userId: string, data: UpdateSellerProfileInput) {
    const seller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new AppError('Seller profile not found', 404);
    }

    // Check GSTIN uniqueness if being updated
    if (data.gstin && data.gstin !== seller.gstin) {
      const existing = await prisma.seller.findUnique({
        where: { gstin: data.gstin },
      });
      if (existing) {
        throw new AppError('GSTIN already registered', 409);
      }
    }

    const updated = await prisma.seller.update({
      where: { userId },
      data: {
        companyName: data.companyName,
        gstin: data.gstin,
        pan: data.pan,
        businessType: data.businessType,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
      },
      include: {
        bankAccounts: true,
      },
    });

    return updated;
  }

  // Update Financier profile
  async updateFinancierProfile(userId: string, data: UpdateFinancierProfileInput) {
    const financier = await prisma.financier.findUnique({
      where: { userId },
    });

    if (!financier) {
      throw new AppError('Financier profile not found', 404);
    }

    const updated = await prisma.financier.update({
      where: { userId },
      data: {
        companyName: data.companyName,
        rbiLicense: data.rbiLicense,
        entityType: data.entityType,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
      },
      include: {
        bankAccounts: true,
      },
    });

    return updated;
  }

  // Get entity ID based on user type
  private async getEntityId(userId: string, userType: UserType): Promise<{ entityId: string; entityType: EntityType }> {
    switch (userType) {
      case 'BUYER': {
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (!buyer) throw new AppError('Buyer profile not found', 404);
        return { entityId: buyer.id, entityType: 'BUYER' };
      }
      case 'SELLER': {
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (!seller) throw new AppError('Seller profile not found', 404);
        return { entityId: seller.id, entityType: 'SELLER' };
      }
      case 'FINANCIER': {
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (!financier) throw new AppError('Financier profile not found', 404);
        return { entityId: financier.id, entityType: 'FINANCIER' };
      }
      default:
        throw new AppError('Invalid user type', 400);
    }
  }

  // Add bank account
  async addBankAccount(userId: string, userType: UserType, data: AddBankAccountInput) {
    const { entityId, entityType } = await this.getEntityId(userId, userType);

    // If setting as primary, unset other primary accounts
    if (data.isPrimary) {
      await this.unsetPrimaryAccounts(entityId, entityType);
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
        accountNo: data.accountNo,
        ifscCode: data.ifscCode,
        bankName: data.bankName,
        branchName: data.branchName,
        accountType: data.accountType,
        isPrimary: data.isPrimary || false,
      },
    });

    return bankAccount;
  }

  // Get bank accounts
  async getBankAccounts(userId: string, userType: UserType) {
    const { entityId, entityType } = await this.getEntityId(userId, userType);

    const accounts = await prisma.bankAccount.findMany({
      where: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return accounts;
  }

  // Update bank account
  async updateBankAccount(
    userId: string,
    userType: UserType,
    accountId: string,
    data: UpdateBankAccountInput
  ) {
    const { entityId, entityType } = await this.getEntityId(userId, userType);

    // Verify ownership
    const account = await prisma.bankAccount.findFirst({
      where: {
        id: accountId,
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
    });

    if (!account) {
      throw new AppError('Bank account not found', 404);
    }

    // If setting as primary, unset other primary accounts
    if (data.isPrimary) {
      await this.unsetPrimaryAccounts(entityId, entityType);
    }

    const updated = await prisma.bankAccount.update({
      where: { id: accountId },
      data: {
        bankName: data.bankName,
        branchName: data.branchName,
        accountType: data.accountType,
        isPrimary: data.isPrimary,
      },
    });

    return updated;
  }

  // Delete bank account
  async deleteBankAccount(userId: string, userType: UserType, accountId: string) {
    const { entityId, entityType } = await this.getEntityId(userId, userType);

    // Verify ownership
    const account = await prisma.bankAccount.findFirst({
      where: {
        id: accountId,
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
    });

    if (!account) {
      throw new AppError('Bank account not found', 404);
    }

    await prisma.bankAccount.delete({
      where: { id: accountId },
    });

    return { message: 'Bank account deleted successfully' };
  }

  // Set bank account as primary
  async setPrimaryBankAccount(userId: string, userType: UserType, accountId: string) {
    const { entityId, entityType } = await this.getEntityId(userId, userType);

    // Verify ownership
    const account = await prisma.bankAccount.findFirst({
      where: {
        id: accountId,
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
      },
    });

    if (!account) {
      throw new AppError('Bank account not found', 404);
    }

    // Unset all primary, then set this one
    await this.unsetPrimaryAccounts(entityId, entityType);

    const updated = await prisma.bankAccount.update({
      where: { id: accountId },
      data: { isPrimary: true },
    });

    return updated;
  }

  // Helper to unset primary accounts
  private async unsetPrimaryAccounts(entityId: string, entityType: EntityType) {
    await prisma.bankAccount.updateMany({
      where: {
        entityType,
        [`${entityType.toLowerCase()}Id`]: entityId,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });
  }

  // Get all KYC-verified sellers (for buyer invoice creation)
  // In production, filter by kycStatus: 'APPROVED'
  // For demo/development, return all sellers
  async getVerifiedSellers(search?: string) {
    const where: any = {};

    // For production, uncomment this:
    // where.kycStatus = 'APPROVED';

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const sellers = await prisma.seller.findMany({
      where,
      select: {
        id: true,
        userId: true,
        companyName: true,
        gstin: true,
        businessType: true,
        city: true,
        state: true,
        kycStatus: true,
      },
      orderBy: { companyName: 'asc' },
      take: 50,
    });

    return sellers;
  }

  // Create a seller referral (when seller is not in the system)
  async createSellerReferral(
    referrerId: string,
    data: { email: string; companyName: string; gstin?: string; contactPhone?: string }
  ) {
    // Check if seller already exists with this email
    const existingByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingByEmail) {
      throw new AppError('A user with this email already exists', 409);
    }

    // Check if GSTIN already exists
    if (data.gstin) {
      const existingByGstin = await prisma.seller.findUnique({
        where: { gstin: data.gstin },
      });

      if (existingByGstin) {
        throw new AppError('A seller with this GSTIN already exists', 409);
      }
    }

    // Check if referral already exists
    const existingReferral = await prisma.sellerReferral.findFirst({
      where: {
        email: data.email,
        status: 'PENDING',
      },
    });

    if (existingReferral) {
      throw new AppError('A referral for this email is already pending', 409);
    }

    // Create referral record
    const referral = await prisma.sellerReferral.create({
      data: {
        referrerId,
        email: data.email,
        companyName: data.companyName,
        gstin: data.gstin,
        contactPhone: data.contactPhone,
        status: 'PENDING',
      },
    });

    return referral;
  }

  // Get referrals made by a buyer
  async getMyReferrals(referrerId: string) {
    const referrals = await prisma.sellerReferral.findMany({
      where: { referrerId },
      orderBy: { invitedAt: 'desc' },
    });

    return referrals;
  }
}

export const profileService = new ProfileService();
