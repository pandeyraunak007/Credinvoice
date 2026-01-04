import { UserStatus, UserType, InvoiceStatus, ProductType, KycStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  ListUsersQuery,
  ListInvoicesQuery,
  ListAuditLogsQuery,
  UpdateUserStatusInput,
  ReviewKycInput,
  ListKycApplicationsQuery,
} from './admin.validation';

export class AdminService {
  // Dashboard statistics
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      pendingKyc,
      totalInvoices,
      openForBidding,
      disbursedAmount,
      pendingRepayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.kycDocument.count({ where: { status: 'PENDING' } }),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'OPEN_FOR_BIDDING' } }),
      prisma.disbursement.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.repayment.count({ where: { status: 'PENDING' } }),
    ]);

    // User breakdown
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      _count: true,
    });

    // Invoice breakdown
    const invoicesByStatus = await prisma.invoice.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        byType: usersByType.reduce((acc, item) => {
          acc[item.userType] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      kyc: {
        pendingReview: pendingKyc,
      },
      invoices: {
        total: totalInvoices,
        openForBidding,
        byStatus: invoicesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      financials: {
        totalDisbursed: disbursedAmount._sum.amount || 0,
        pendingRepayments,
      },
    };
  }

  // List all users
  async listUsers(query: ListUsersQuery) {
    const { userType, status, search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userType) where.userType = userType;
    if (status) where.status = status;
    if (search) {
      where.email = { contains: search };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          userType: true,
          status: true,
          createdAt: true,
          buyer: { select: { companyName: true, kycStatus: true } },
          seller: { select: { companyName: true, kycStatus: true } },
          financier: { select: { companyName: true, kycStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Flatten profile info
    const usersWithProfile = users.map((user) => {
      const profile = user.buyer || user.seller || user.financier;
      return {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
        companyName: profile?.companyName || null,
        kycStatus: profile?.kycStatus || null,
        createdAt: user.createdAt,
      };
    });

    return {
      users: usersWithProfile,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get user details (admin view)
  async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        buyer: {
          include: {
            bankAccounts: true,
            kycDocuments: true,
          },
        },
        seller: {
          include: {
            bankAccounts: true,
            kycDocuments: true,
          },
        },
        financier: {
          include: {
            bankAccounts: true,
            kycDocuments: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Update user status
  async updateUserStatus(userId: string, data: UpdateUserStatusInput, adminUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: data.status as UserStatus },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_USER_STATUS',
        entityType: 'USER',
        entityId: userId,
        oldValues: JSON.stringify({ status: user.status }),
        newValues: JSON.stringify({ status: data.status, reason: data.reason }),
      },
    });

    return updated;
  }

  // List all invoices (admin view) with advanced filtering
  async listInvoices(query: ListInvoicesQuery) {
    const {
      status,
      productType,
      search,
      minAmount,
      maxAmount,
      dateField,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Basic filters
    if (status) where.status = status;
    if (productType) where.productType = productType;

    // Multi-field search (invoice number, seller name, buyer name)
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { sellerName: { contains: search, mode: 'insensitive' } },
        { buyerName: { contains: search, mode: 'insensitive' } },
        { seller: { companyName: { contains: search, mode: 'insensitive' } } },
        { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.totalAmount = {};
      if (minAmount !== undefined) where.totalAmount.gte = minAmount;
      if (maxAmount !== undefined) where.totalAmount.lte = maxAmount;
    }

    // Date range filter (user can choose createdAt or dueDate)
    if (startDate || endDate) {
      const dateColumn = dateField || 'createdAt';
      where[dateColumn] = {};
      if (startDate) where[dateColumn].gte = startDate;
      if (endDate) where[dateColumn].lte = endDate;
    }

    // Dynamic sorting
    const orderByField = sortBy || 'createdAt';
    const orderByDirection = sortOrder || 'desc';

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          buyer: { select: { companyName: true } },
          seller: { select: { companyName: true } },
          discountOffer: { select: { status: true, discountPercentage: true } },
          bids: { select: { id: true, status: true } },
          disbursement: { select: { status: true, amount: true } },
        },
        orderBy: { [orderByField]: orderByDirection },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // List transactions (disbursements)
  async listTransactions(query: ListInvoicesQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.disbursement.findMany({
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              sellerName: true,
              buyerName: true,
            },
          },
          financier: { select: { companyName: true } },
          repayment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.disbursement.count(),
    ]);

    return {
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // List audit logs
  async listAuditLogs(query: ListAuditLogsQuery) {
    const { userId, action, entityType, startDate, endDate, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action };
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true, userType: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Parse JSON values
    const parsed = logs.map((log) => ({
      ...log,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
    }));

    return {
      logs: parsed,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Create audit log (utility)
  async createAuditLog(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  // List KYC applications (users with KYC data)
  async listKycApplications(query: ListKycApplicationsQuery) {
    const { status, userType, page, limit } = query;
    const skip = (page - 1) * limit;

    // Build where clause for each entity type
    const results: any[] = [];

    // Get buyers
    if (!userType || userType === 'BUYER') {
      const buyerWhere: any = {};
      if (status) buyerWhere.kycStatus = status;

      const buyers = await prisma.buyer.findMany({
        where: buyerWhere,
        include: {
          user: { select: { id: true, email: true, createdAt: true, status: true } },
          kycDocuments: { select: { id: true, documentType: true, status: true } },
          bankAccounts: { select: { id: true, bankName: true, isPrimary: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      buyers.forEach((b) => {
        results.push({
          id: b.userId,
          entityType: 'BUYER',
          companyName: b.companyName,
          gstin: b.gstin,
          pan: b.pan,
          kycStatus: b.kycStatus,
          email: b.user.email,
          userStatus: b.user.status,
          documentsCount: b.kycDocuments.length,
          verifiedDocs: b.kycDocuments.filter((d) => d.status === 'APPROVED').length,
          pendingDocs: b.kycDocuments.filter((d) => d.status === 'PENDING').length,
          hasBankAccount: b.bankAccounts.length > 0,
          createdAt: b.createdAt,
          industry: b.industry,
          city: b.city,
          state: b.state,
        });
      });
    }

    // Get sellers
    if (!userType || userType === 'SELLER') {
      const sellerWhere: any = {};
      if (status) sellerWhere.kycStatus = status;

      const sellers = await prisma.seller.findMany({
        where: sellerWhere,
        include: {
          user: { select: { id: true, email: true, createdAt: true, status: true } },
          kycDocuments: { select: { id: true, documentType: true, status: true } },
          bankAccounts: { select: { id: true, bankName: true, isPrimary: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      sellers.forEach((s) => {
        results.push({
          id: s.userId,
          entityType: 'SELLER',
          companyName: s.companyName,
          gstin: s.gstin,
          pan: s.pan,
          kycStatus: s.kycStatus,
          email: s.user.email,
          userStatus: s.user.status,
          documentsCount: s.kycDocuments.length,
          verifiedDocs: s.kycDocuments.filter((d) => d.status === 'APPROVED').length,
          pendingDocs: s.kycDocuments.filter((d) => d.status === 'PENDING').length,
          hasBankAccount: s.bankAccounts.length > 0,
          createdAt: s.createdAt,
          businessType: s.businessType,
          city: s.city,
          state: s.state,
        });
      });
    }

    // Get financiers
    if (!userType || userType === 'FINANCIER') {
      const financierWhere: any = {};
      if (status) financierWhere.kycStatus = status;

      const financiers = await prisma.financier.findMany({
        where: financierWhere,
        include: {
          user: { select: { id: true, email: true, createdAt: true, status: true } },
          kycDocuments: { select: { id: true, documentType: true, status: true } },
          bankAccounts: { select: { id: true, bankName: true, isPrimary: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      financiers.forEach((f) => {
        results.push({
          id: f.userId,
          entityType: 'FINANCIER',
          companyName: f.companyName,
          rbiLicense: f.rbiLicense,
          kycStatus: f.kycStatus,
          email: f.user.email,
          userStatus: f.user.status,
          documentsCount: f.kycDocuments.length,
          verifiedDocs: f.kycDocuments.filter((d) => d.status === 'APPROVED').length,
          pendingDocs: f.kycDocuments.filter((d) => d.status === 'PENDING').length,
          hasBankAccount: f.bankAccounts.length > 0,
          createdAt: f.createdAt,
          entityType2: f.entityType,
          city: f.city,
          state: f.state,
        });
      });
    }

    // Sort by createdAt desc
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const total = results.length;
    const paginated = results.slice(skip, skip + limit);

    return {
      applications: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get KYC application details for a user
  async getKycApplicationDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        buyer: {
          include: {
            bankAccounts: true,
            kycDocuments: true,
          },
        },
        seller: {
          include: {
            bankAccounts: true,
            kycDocuments: true,
          },
        },
        financier: {
          include: {
            bankAccounts: true,
            kycDocuments: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const entity = user.buyer || user.seller || user.financier;
    if (!entity) {
      throw new AppError('User profile not found', 404);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        status: user.status,
        createdAt: user.createdAt,
      },
      entity,
      entityType: user.userType,
    };
  }

  // Approve KYC for a user
  async approveKyc(userId: string, adminUserId: string, notes?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { buyer: true, seller: true, financier: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let entity: any;
    let entityType: string;
    let oldStatus: string;

    if (user.buyer) {
      oldStatus = user.buyer.kycStatus;
      entity = await prisma.buyer.update({
        where: { userId },
        data: { kycStatus: 'APPROVED' },
      });
      entityType = 'BUYER';
    } else if (user.seller) {
      oldStatus = user.seller.kycStatus;
      entity = await prisma.seller.update({
        where: { userId },
        data: { kycStatus: 'APPROVED' },
      });
      entityType = 'SELLER';
    } else if (user.financier) {
      oldStatus = user.financier.kycStatus;
      entity = await prisma.financier.update({
        where: { userId },
        data: { kycStatus: 'APPROVED' },
      });
      entityType = 'FINANCIER';
    } else {
      throw new AppError('User profile not found', 404);
    }

    // Also approve all pending documents
    await prisma.kycDocument.updateMany({
      where: {
        [`${entityType.toLowerCase()}Id`]: entity.id,
        status: 'PENDING',
      },
      data: { status: 'APPROVED' },
    });

    // Create audit log
    await this.createAuditLog(
      adminUserId,
      'APPROVE_KYC',
      entityType,
      entity.id,
      { kycStatus: oldStatus },
      { kycStatus: 'APPROVED', notes }
    );

    return entity;
  }

  // Reject KYC for a user
  async rejectKyc(userId: string, adminUserId: string, data: ReviewKycInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { buyer: true, seller: true, financier: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let entity: any;
    let entityType: string;
    let oldStatus: string;

    if (user.buyer) {
      oldStatus = user.buyer.kycStatus;
      entity = await prisma.buyer.update({
        where: { userId },
        data: { kycStatus: 'REJECTED' },
      });
      entityType = 'BUYER';
    } else if (user.seller) {
      oldStatus = user.seller.kycStatus;
      entity = await prisma.seller.update({
        where: { userId },
        data: { kycStatus: 'REJECTED' },
      });
      entityType = 'SELLER';
    } else if (user.financier) {
      oldStatus = user.financier.kycStatus;
      entity = await prisma.financier.update({
        where: { userId },
        data: { kycStatus: 'REJECTED' },
      });
      entityType = 'FINANCIER';
    } else {
      throw new AppError('User profile not found', 404);
    }

    // Create audit log
    await this.createAuditLog(
      adminUserId,
      'REJECT_KYC',
      entityType,
      entity.id,
      { kycStatus: oldStatus },
      { kycStatus: 'REJECTED', reason: data.reason, notes: data.notes }
    );

    return entity;
  }
}

export const adminService = new AdminService();
