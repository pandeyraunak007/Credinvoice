import { UserStatus, UserType, InvoiceStatus, ProductType } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  ListUsersQuery,
  ListInvoicesQuery,
  ListAuditLogsQuery,
  UpdateUserStatusInput,
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

  // List all invoices (admin view)
  async listInvoices(query: ListInvoicesQuery) {
    const { status, productType, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (productType) where.productType = productType;

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
        orderBy: { createdAt: 'desc' },
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
}

export const adminService = new AdminService();
