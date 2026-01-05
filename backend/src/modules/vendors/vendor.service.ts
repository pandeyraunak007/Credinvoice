import { UserType, MappingStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  AddVendorInput,
  UpdateVendorInput,
  ListVendorsQuery,
  ReferVendorInput,
} from './vendor.validation';

export class VendorService {
  /**
   * Get entity ID (buyer/seller/financier) from userId
   */
  private async getEntityId(userId: string, userType: UserType) {
    switch (userType) {
      case 'BUYER': {
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (!buyer) throw new AppError('Buyer profile not found', 404);
        return { entityId: buyer.id, entityType: 'BUYER' as const };
      }
      case 'SELLER': {
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (!seller) throw new AppError('Seller profile not found', 404);
        return { entityId: seller.id, entityType: 'SELLER' as const };
      }
      case 'FINANCIER': {
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (!financier) throw new AppError('Financier profile not found', 404);
        return { entityId: financier.id, entityType: 'FINANCIER' as const };
      }
      default:
        throw new AppError('Invalid user type', 400);
    }
  }

  /**
   * Get all vendors for a user based on their type
   * - Buyer sees Sellers
   * - Seller sees Buyers
   * - Financier sees both Buyers and Sellers
   */
  async getMyVendors(userId: string, userType: UserType, query: ListVendorsQuery) {
    const { entityId } = await this.getEntityId(userId, userType);
    const { search, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const statusFilter = status === 'ALL' ? {} : { status: status as MappingStatus };

    if (userType === 'BUYER') {
      // Buyer's vendors are Sellers
      const whereClause: any = {
        buyerId: entityId,
        ...statusFilter,
      };

      if (search) {
        whereClause.seller = {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { gstin: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [vendors, total] = await Promise.all([
        prisma.buyerSellerMapping.findMany({
          where: whereClause,
          include: {
            seller: {
              select: {
                id: true,
                userId: true,
                companyName: true,
                gstin: true,
                businessType: true,
                city: true,
                state: true,
                contactName: true,
                contactPhone: true,
                kycStatus: true,
                performanceScore: true,
                avgDaysToPayment: true,
                totalInvoicesSettled: true,
              },
            },
          },
          orderBy: { mappedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.buyerSellerMapping.count({ where: whereClause }),
      ]);

      // Get invoice counts for each vendor
      const vendorIds = vendors.map(v => v.sellerId);
      const invoiceCounts = await prisma.invoice.groupBy({
        by: ['sellerId'],
        where: {
          buyerId: entityId,
          sellerId: { in: vendorIds },
        },
        _count: { _all: true },
        _sum: { totalAmount: true },
      });

      const invoiceMap = new Map(
        invoiceCounts.map(ic => [ic.sellerId, { count: ic._count?._all || 0, totalAmount: ic._sum?.totalAmount || 0 }])
      );

      return {
        vendors: vendors.map(v => ({
          id: v.id,
          vendorId: v.seller.id,
          vendorUserId: v.seller.userId,
          vendorType: 'SELLER',
          companyName: v.seller.companyName,
          gstin: v.seller.gstin,
          businessType: v.seller.businessType,
          city: v.seller.city,
          state: v.seller.state,
          contactName: v.seller.contactName,
          contactPhone: v.seller.contactPhone,
          kycStatus: v.seller.kycStatus,
          performanceScore: v.seller.performanceScore,
          avgDaysToPayment: v.seller.avgDaysToPayment,
          totalInvoicesSettled: v.seller.totalInvoicesSettled,
          status: v.status,
          notes: v.notes,
          addedBy: v.addedBy,
          mappedAt: v.mappedAt,
          invoiceCount: invoiceMap.get(v.sellerId)?.count || 0,
          totalInvoiceAmount: invoiceMap.get(v.sellerId)?.totalAmount || 0,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    if (userType === 'SELLER') {
      // Seller's vendors are Buyers (customers)
      const whereClause: any = {
        sellerId: entityId,
        ...statusFilter,
      };

      if (search) {
        whereClause.buyer = {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { gstin: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [vendors, total] = await Promise.all([
        prisma.buyerSellerMapping.findMany({
          where: whereClause,
          include: {
            buyer: {
              select: {
                id: true,
                userId: true,
                companyName: true,
                gstin: true,
                industry: true,
                city: true,
                state: true,
                contactName: true,
                contactPhone: true,
                kycStatus: true,
                reliabilityScore: true,
                onTimePaymentRate: true,
                avgDaysToPayment: true,
                totalInvoicesPaid: true,
              },
            },
          },
          orderBy: { mappedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.buyerSellerMapping.count({ where: whereClause }),
      ]);

      // Get invoice counts
      const vendorIds = vendors.map(v => v.buyerId);
      const invoiceCounts = await prisma.invoice.groupBy({
        by: ['buyerId'],
        where: {
          sellerId: entityId,
          buyerId: { in: vendorIds },
        },
        _count: { _all: true },
        _sum: { totalAmount: true },
      });

      const invoiceMap = new Map(
        invoiceCounts.map(ic => [ic.buyerId, { count: ic._count?._all || 0, totalAmount: ic._sum?.totalAmount || 0 }])
      );

      return {
        vendors: vendors.map(v => ({
          id: v.id,
          vendorId: v.buyer.id,
          vendorUserId: v.buyer.userId,
          vendorType: 'BUYER',
          companyName: v.buyer.companyName,
          gstin: v.buyer.gstin,
          industry: v.buyer.industry,
          city: v.buyer.city,
          state: v.buyer.state,
          contactName: v.buyer.contactName,
          contactPhone: v.buyer.contactPhone,
          kycStatus: v.buyer.kycStatus,
          reliabilityScore: v.buyer.reliabilityScore,
          onTimePaymentRate: v.buyer.onTimePaymentRate,
          avgDaysToPayment: v.buyer.avgDaysToPayment,
          totalInvoicesPaid: v.buyer.totalInvoicesPaid,
          status: v.status,
          notes: v.notes,
          addedBy: v.addedBy,
          mappedAt: v.mappedAt,
          invoiceCount: invoiceMap.get(v.buyerId)?.count || 0,
          totalInvoiceAmount: invoiceMap.get(v.buyerId)?.totalAmount || 0,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    if (userType === 'FINANCIER') {
      // Financier sees both Buyers and Sellers they've worked with
      const [buyerMappings, sellerMappings] = await Promise.all([
        prisma.buyerFinancierMapping.findMany({
          where: {
            financierId: entityId,
            ...(status !== 'ALL' ? { status: status as MappingStatus } : {}),
            ...(search ? {
              buyer: {
                OR: [
                  { companyName: { contains: search, mode: 'insensitive' } },
                  { gstin: { contains: search, mode: 'insensitive' } },
                ],
              },
            } : {}),
          },
          include: {
            buyer: {
              select: {
                id: true,
                userId: true,
                companyName: true,
                gstin: true,
                industry: true,
                city: true,
                state: true,
                contactName: true,
                contactPhone: true,
                kycStatus: true,
                reliabilityScore: true,
                onTimePaymentRate: true,
              },
            },
          },
          orderBy: { mappedAt: 'desc' },
        }),
        prisma.sellerFinancierMapping.findMany({
          where: {
            financierId: entityId,
            ...(status !== 'ALL' ? { status: status as MappingStatus } : {}),
            ...(search ? {
              seller: {
                OR: [
                  { companyName: { contains: search, mode: 'insensitive' } },
                  { gstin: { contains: search, mode: 'insensitive' } },
                ],
              },
            } : {}),
          },
          include: {
            seller: {
              select: {
                id: true,
                userId: true,
                companyName: true,
                gstin: true,
                businessType: true,
                city: true,
                state: true,
                contactName: true,
                contactPhone: true,
                kycStatus: true,
                performanceScore: true,
                avgDaysToPayment: true,
              },
            },
          },
          orderBy: { mappedAt: 'desc' },
        }),
      ]);

      // Combine and sort by mappedAt
      const allVendors = [
        ...buyerMappings.map(v => ({
          id: v.id,
          vendorId: v.buyer.id,
          vendorUserId: v.buyer.userId,
          vendorType: 'BUYER' as const,
          companyName: v.buyer.companyName,
          gstin: v.buyer.gstin,
          industry: v.buyer.industry,
          city: v.buyer.city,
          state: v.buyer.state,
          contactName: v.buyer.contactName,
          contactPhone: v.buyer.contactPhone,
          kycStatus: v.buyer.kycStatus,
          reliabilityScore: v.buyer.reliabilityScore,
          onTimePaymentRate: v.buyer.onTimePaymentRate,
          status: v.status,
          notes: v.notes,
          addedBy: v.addedBy,
          mappedAt: v.mappedAt,
        })),
        ...sellerMappings.map(v => ({
          id: v.id,
          vendorId: v.seller.id,
          vendorUserId: v.seller.userId,
          vendorType: 'SELLER' as const,
          companyName: v.seller.companyName,
          gstin: v.seller.gstin,
          businessType: v.seller.businessType,
          city: v.seller.city,
          state: v.seller.state,
          contactName: v.seller.contactName,
          contactPhone: v.seller.contactPhone,
          kycStatus: v.seller.kycStatus,
          performanceScore: v.seller.performanceScore,
          avgDaysToPayment: v.seller.avgDaysToPayment,
          status: v.status,
          notes: v.notes,
          addedBy: v.addedBy,
          mappedAt: v.mappedAt,
        })),
      ].sort((a, b) => b.mappedAt.getTime() - a.mappedAt.getTime());

      const total = allVendors.length;
      const paginatedVendors = allVendors.slice(skip, skip + limit);

      return {
        vendors: paginatedVendors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    throw new AppError('Invalid user type', 400);
  }

  /**
   * Get vendor detail with transaction history
   */
  async getVendorDetail(userId: string, userType: UserType, vendorId: string) {
    const { entityId } = await this.getEntityId(userId, userType);

    if (userType === 'BUYER') {
      // Vendor is a Seller
      const mapping = await prisma.buyerSellerMapping.findFirst({
        where: {
          buyerId: entityId,
          sellerId: vendorId,
        },
        include: {
          seller: {
            select: {
              id: true,
              userId: true,
              companyName: true,
              gstin: true,
              pan: true,
              businessType: true,
              address: true,
              city: true,
              state: true,
              pincode: true,
              contactName: true,
              contactPhone: true,
              kycStatus: true,
              performanceScore: true,
              avgDaysToPayment: true,
              totalInvoicesSettled: true,
              onTimePayments: true,
              latePayments: true,
              lastMetricsUpdate: true,
            },
          },
        },
      });

      if (!mapping) {
        throw new AppError('Vendor not found in your list', 404);
      }

      // Get invoices with this seller
      const invoices = await prisma.invoice.findMany({
        where: {
          buyerId: entityId,
          sellerId: vendorId,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          dueDate: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      });

      // Get summary stats
      const stats = await prisma.invoice.aggregate({
        where: {
          buyerId: entityId,
          sellerId: vendorId,
        },
        _count: { _all: true },
        _sum: { totalAmount: true },
      });

      return {
        mapping: {
          id: mapping.id,
          status: mapping.status,
          notes: mapping.notes,
          addedBy: mapping.addedBy,
          mappedAt: mapping.mappedAt,
        },
        vendor: {
          ...mapping.seller,
          vendorType: 'SELLER',
        },
        transactions: invoices.map(i => ({ ...i, amount: i.totalAmount })),
        stats: {
          totalInvoices: stats._count?._all || 0,
          totalAmount: stats._sum?.totalAmount || 0,
        },
      };
    }

    if (userType === 'SELLER') {
      // Vendor is a Buyer
      const mapping = await prisma.buyerSellerMapping.findFirst({
        where: {
          sellerId: entityId,
          buyerId: vendorId,
        },
        include: {
          buyer: {
            select: {
              id: true,
              userId: true,
              companyName: true,
              gstin: true,
              pan: true,
              industry: true,
              address: true,
              city: true,
              state: true,
              pincode: true,
              contactName: true,
              contactPhone: true,
              kycStatus: true,
              reliabilityScore: true,
              onTimePaymentRate: true,
              avgDaysToPayment: true,
              totalInvoicesPaid: true,
              onTimePayments: true,
              latePayments: true,
              lastMetricsUpdate: true,
            },
          },
        },
      });

      if (!mapping) {
        throw new AppError('Vendor not found in your list', 404);
      }

      // Get invoices with this buyer
      const invoices = await prisma.invoice.findMany({
        where: {
          sellerId: entityId,
          buyerId: vendorId,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          dueDate: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      });

      const stats = await prisma.invoice.aggregate({
        where: {
          sellerId: entityId,
          buyerId: vendorId,
        },
        _count: { _all: true },
        _sum: { totalAmount: true },
      });

      return {
        mapping: {
          id: mapping.id,
          status: mapping.status,
          notes: mapping.notes,
          addedBy: mapping.addedBy,
          mappedAt: mapping.mappedAt,
        },
        vendor: {
          ...mapping.buyer,
          vendorType: 'BUYER',
        },
        transactions: invoices.map(i => ({ ...i, amount: i.totalAmount })),
        stats: {
          totalInvoices: stats._count?._all || 0,
          totalAmount: stats._sum?.totalAmount || 0,
        },
      };
    }

    if (userType === 'FINANCIER') {
      // Try buyer first, then seller
      const buyerMapping = await prisma.buyerFinancierMapping.findFirst({
        where: {
          financierId: entityId,
          buyerId: vendorId,
        },
        include: {
          buyer: true,
        },
      });

      if (buyerMapping) {
        // Get disbursements through invoices where this buyer is involved
        const disbursements = await prisma.disbursement.findMany({
          where: {
            financierId: entityId,
            invoice: {
              buyerId: vendorId,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            amount: true,
            status: true,
            disbursedAt: true,
            createdAt: true,
            invoice: {
              select: {
                invoiceNumber: true,
              },
            },
          },
        });

        return {
          mapping: {
            id: buyerMapping.id,
            status: buyerMapping.status,
            notes: buyerMapping.notes,
            addedBy: buyerMapping.addedBy,
            mappedAt: buyerMapping.mappedAt,
          },
          vendor: {
            ...buyerMapping.buyer,
            vendorType: 'BUYER',
          },
          transactions: disbursements,
        };
      }

      const sellerMapping = await prisma.sellerFinancierMapping.findFirst({
        where: {
          financierId: entityId,
          sellerId: vendorId,
        },
        include: {
          seller: true,
        },
      });

      if (sellerMapping) {
        const disbursements = await prisma.disbursement.findMany({
          where: {
            financierId: entityId,
            invoice: {
              sellerId: vendorId,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            amount: true,
            status: true,
            disbursedAt: true,
            createdAt: true,
            invoice: {
              select: {
                invoiceNumber: true,
              },
            },
          },
        });

        return {
          mapping: {
            id: sellerMapping.id,
            status: sellerMapping.status,
            notes: sellerMapping.notes,
            addedBy: sellerMapping.addedBy,
            mappedAt: sellerMapping.mappedAt,
          },
          vendor: {
            ...sellerMapping.seller,
            vendorType: 'SELLER',
          },
          transactions: disbursements,
        };
      }

      throw new AppError('Vendor not found in your list', 404);
    }

    throw new AppError('Invalid user type', 400);
  }

  /**
   * Add vendor manually (creates mapping)
   */
  async addVendor(userId: string, userType: UserType, data: AddVendorInput) {
    const { entityId } = await this.getEntityId(userId, userType);
    const { vendorId, vendorType, notes } = data;

    if (userType === 'BUYER') {
      if (vendorType !== 'SELLER') {
        throw new AppError('Buyers can only add Sellers as vendors', 400);
      }

      // Verify seller exists and is KYC approved (or exists for demo)
      const seller = await prisma.seller.findUnique({
        where: { id: vendorId },
      });

      if (!seller) {
        throw new AppError('Seller not found', 404);
      }

      // Check if mapping already exists
      const existing = await prisma.buyerSellerMapping.findUnique({
        where: {
          buyerId_sellerId: {
            buyerId: entityId,
            sellerId: vendorId,
          },
        },
      });

      if (existing) {
        if (existing.status === 'INACTIVE') {
          // Reactivate
          const updated = await prisma.buyerSellerMapping.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE', notes, addedBy: 'MANUAL' },
          });
          return updated;
        }
        throw new AppError('Vendor already in your list', 409);
      }

      const mapping = await prisma.buyerSellerMapping.create({
        data: {
          buyerId: entityId,
          sellerId: vendorId,
          notes,
          addedBy: 'MANUAL',
        },
      });

      return mapping;
    }

    if (userType === 'SELLER') {
      if (vendorType !== 'BUYER') {
        throw new AppError('Sellers can only add Buyers as vendors', 400);
      }

      const buyer = await prisma.buyer.findUnique({
        where: { id: vendorId },
      });

      if (!buyer) {
        throw new AppError('Buyer not found', 404);
      }

      const existing = await prisma.buyerSellerMapping.findUnique({
        where: {
          buyerId_sellerId: {
            buyerId: vendorId,
            sellerId: entityId,
          },
        },
      });

      if (existing) {
        if (existing.status === 'INACTIVE') {
          const updated = await prisma.buyerSellerMapping.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE', notes, addedBy: 'MANUAL' },
          });
          return updated;
        }
        throw new AppError('Vendor already in your list', 409);
      }

      const mapping = await prisma.buyerSellerMapping.create({
        data: {
          buyerId: vendorId,
          sellerId: entityId,
          notes,
          addedBy: 'MANUAL',
        },
      });

      return mapping;
    }

    if (userType === 'FINANCIER') {
      if (vendorType === 'BUYER') {
        const buyer = await prisma.buyer.findUnique({
          where: { id: vendorId },
        });

        if (!buyer) {
          throw new AppError('Buyer not found', 404);
        }

        const existing = await prisma.buyerFinancierMapping.findUnique({
          where: {
            buyerId_financierId: {
              buyerId: vendorId,
              financierId: entityId,
            },
          },
        });

        if (existing) {
          if (existing.status === 'INACTIVE') {
            const updated = await prisma.buyerFinancierMapping.update({
              where: { id: existing.id },
              data: { status: 'ACTIVE', notes, addedBy: 'MANUAL' },
            });
            return updated;
          }
          throw new AppError('Vendor already in your list', 409);
        }

        const mapping = await prisma.buyerFinancierMapping.create({
          data: {
            buyerId: vendorId,
            financierId: entityId,
            notes,
            addedBy: 'MANUAL',
          },
        });

        return mapping;
      }

      if (vendorType === 'SELLER') {
        const seller = await prisma.seller.findUnique({
          where: { id: vendorId },
        });

        if (!seller) {
          throw new AppError('Seller not found', 404);
        }

        const existing = await prisma.sellerFinancierMapping.findUnique({
          where: {
            sellerId_financierId: {
              sellerId: vendorId,
              financierId: entityId,
            },
          },
        });

        if (existing) {
          if (existing.status === 'INACTIVE') {
            const updated = await prisma.sellerFinancierMapping.update({
              where: { id: existing.id },
              data: { status: 'ACTIVE', notes, addedBy: 'MANUAL' },
            });
            return updated;
          }
          throw new AppError('Vendor already in your list', 409);
        }

        const mapping = await prisma.sellerFinancierMapping.create({
          data: {
            sellerId: vendorId,
            financierId: entityId,
            notes,
            addedBy: 'MANUAL',
          },
        });

        return mapping;
      }
    }

    throw new AppError('Invalid operation', 400);
  }

  /**
   * Remove vendor (soft delete - set INACTIVE)
   */
  async removeVendor(userId: string, userType: UserType, vendorId: string) {
    const { entityId } = await this.getEntityId(userId, userType);

    if (userType === 'BUYER') {
      const mapping = await prisma.buyerSellerMapping.findFirst({
        where: {
          buyerId: entityId,
          sellerId: vendorId,
        },
      });

      if (!mapping) {
        throw new AppError('Vendor not found in your list', 404);
      }

      await prisma.buyerSellerMapping.update({
        where: { id: mapping.id },
        data: { status: 'INACTIVE' },
      });

      return { message: 'Vendor removed successfully' };
    }

    if (userType === 'SELLER') {
      const mapping = await prisma.buyerSellerMapping.findFirst({
        where: {
          sellerId: entityId,
          buyerId: vendorId,
        },
      });

      if (!mapping) {
        throw new AppError('Vendor not found in your list', 404);
      }

      await prisma.buyerSellerMapping.update({
        where: { id: mapping.id },
        data: { status: 'INACTIVE' },
      });

      return { message: 'Vendor removed successfully' };
    }

    if (userType === 'FINANCIER') {
      // Try buyer first
      const buyerMapping = await prisma.buyerFinancierMapping.findFirst({
        where: {
          financierId: entityId,
          buyerId: vendorId,
        },
      });

      if (buyerMapping) {
        await prisma.buyerFinancierMapping.update({
          where: { id: buyerMapping.id },
          data: { status: 'INACTIVE' },
        });
        return { message: 'Vendor removed successfully' };
      }

      // Try seller
      const sellerMapping = await prisma.sellerFinancierMapping.findFirst({
        where: {
          financierId: entityId,
          sellerId: vendorId,
        },
      });

      if (sellerMapping) {
        await prisma.sellerFinancierMapping.update({
          where: { id: sellerMapping.id },
          data: { status: 'INACTIVE' },
        });
        return { message: 'Vendor removed successfully' };
      }

      throw new AppError('Vendor not found in your list', 404);
    }

    throw new AppError('Invalid user type', 400);
  }

  /**
   * Update vendor (status, notes)
   */
  async updateVendor(userId: string, userType: UserType, vendorId: string, data: UpdateVendorInput) {
    const { entityId } = await this.getEntityId(userId, userType);

    if (userType === 'BUYER') {
      const mapping = await prisma.buyerSellerMapping.findFirst({
        where: {
          buyerId: entityId,
          sellerId: vendorId,
        },
      });

      if (!mapping) {
        throw new AppError('Vendor not found in your list', 404);
      }

      const updated = await prisma.buyerSellerMapping.update({
        where: { id: mapping.id },
        data: {
          ...(data.status && { status: data.status as MappingStatus }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });

      return updated;
    }

    if (userType === 'SELLER') {
      const mapping = await prisma.buyerSellerMapping.findFirst({
        where: {
          sellerId: entityId,
          buyerId: vendorId,
        },
      });

      if (!mapping) {
        throw new AppError('Vendor not found in your list', 404);
      }

      const updated = await prisma.buyerSellerMapping.update({
        where: { id: mapping.id },
        data: {
          ...(data.status && { status: data.status as MappingStatus }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      });

      return updated;
    }

    if (userType === 'FINANCIER') {
      // Try buyer first
      let mapping = await prisma.buyerFinancierMapping.findFirst({
        where: {
          financierId: entityId,
          buyerId: vendorId,
        },
      });

      if (mapping) {
        const updated = await prisma.buyerFinancierMapping.update({
          where: { id: mapping.id },
          data: {
            ...(data.status && { status: data.status as MappingStatus }),
            ...(data.notes !== undefined && { notes: data.notes }),
          },
        });
        return updated;
      }

      // Try seller
      const sellerMapping = await prisma.sellerFinancierMapping.findFirst({
        where: {
          financierId: entityId,
          sellerId: vendorId,
        },
      });

      if (sellerMapping) {
        const updated = await prisma.sellerFinancierMapping.update({
          where: { id: sellerMapping.id },
          data: {
            ...(data.status && { status: data.status as MappingStatus }),
            ...(data.notes !== undefined && { notes: data.notes }),
          },
        });
        return updated;
      }

      throw new AppError('Vendor not found in your list', 404);
    }

    throw new AppError('Invalid user type', 400);
  }

  /**
   * Get available vendors to add (KYC approved, not already added)
   */
  async getAvailableVendors(userId: string, userType: UserType, search?: string) {
    const { entityId } = await this.getEntityId(userId, userType);

    if (userType === 'BUYER') {
      // Get sellers not already in buyer's list
      const existingMappings = await prisma.buyerSellerMapping.findMany({
        where: {
          buyerId: entityId,
          status: 'ACTIVE',
        },
        select: { sellerId: true },
      });

      const excludeIds = existingMappings.map(m => m.sellerId);

      const where: any = {
        id: { notIn: excludeIds },
        // For production: kycStatus: 'APPROVED',
      };

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
          companyName: true,
          gstin: true,
          businessType: true,
          city: true,
          state: true,
          kycStatus: true,
          performanceScore: true,
        },
        orderBy: { companyName: 'asc' },
        take: 50,
      });

      return sellers.map(s => ({
        ...s,
        vendorType: 'SELLER',
      }));
    }

    if (userType === 'SELLER') {
      // Get buyers not already in seller's list
      const existingMappings = await prisma.buyerSellerMapping.findMany({
        where: {
          sellerId: entityId,
          status: 'ACTIVE',
        },
        select: { buyerId: true },
      });

      const excludeIds = existingMappings.map(m => m.buyerId);

      const where: any = {
        id: { notIn: excludeIds },
        // For production: kycStatus: 'APPROVED',
      };

      if (search) {
        where.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { gstin: { contains: search, mode: 'insensitive' } },
        ];
      }

      const buyers = await prisma.buyer.findMany({
        where,
        select: {
          id: true,
          companyName: true,
          gstin: true,
          industry: true,
          city: true,
          state: true,
          kycStatus: true,
          reliabilityScore: true,
        },
        orderBy: { companyName: 'asc' },
        take: 50,
      });

      return buyers.map(b => ({
        ...b,
        vendorType: 'BUYER',
      }));
    }

    if (userType === 'FINANCIER') {
      // Get both buyers and sellers not in financier's list
      const [existingBuyers, existingSellers] = await Promise.all([
        prisma.buyerFinancierMapping.findMany({
          where: { financierId: entityId, status: 'ACTIVE' },
          select: { buyerId: true },
        }),
        prisma.sellerFinancierMapping.findMany({
          where: { financierId: entityId, status: 'ACTIVE' },
          select: { sellerId: true },
        }),
      ]);

      const excludeBuyerIds = existingBuyers.map(m => m.buyerId);
      const excludeSellerIds = existingSellers.map(m => m.sellerId);

      const buyerWhere: any = {
        id: { notIn: excludeBuyerIds },
      };
      const sellerWhere: any = {
        id: { notIn: excludeSellerIds },
      };

      if (search) {
        buyerWhere.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { gstin: { contains: search, mode: 'insensitive' } },
        ];
        sellerWhere.OR = [
          { companyName: { contains: search, mode: 'insensitive' } },
          { gstin: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [buyers, sellers] = await Promise.all([
        prisma.buyer.findMany({
          where: buyerWhere,
          select: {
            id: true,
            companyName: true,
            gstin: true,
            industry: true,
            city: true,
            state: true,
            kycStatus: true,
            reliabilityScore: true,
          },
          orderBy: { companyName: 'asc' },
          take: 25,
        }),
        prisma.seller.findMany({
          where: sellerWhere,
          select: {
            id: true,
            companyName: true,
            gstin: true,
            businessType: true,
            city: true,
            state: true,
            kycStatus: true,
            performanceScore: true,
          },
          orderBy: { companyName: 'asc' },
          take: 25,
        }),
      ]);

      return [
        ...buyers.map(b => ({ ...b, vendorType: 'BUYER' as const })),
        ...sellers.map(s => ({ ...s, vendorType: 'SELLER' as const })),
      ];
    }

    throw new AppError('Invalid user type', 400);
  }

  /**
   * Create vendor referral (for non-existent vendors)
   */
  async referVendor(userId: string, userType: UserType, data: ReferVendorInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists. Try adding them directly.', 409);
    }

    // Check GSTIN if provided
    if (data.gstin) {
      if (data.vendorType === 'SELLER') {
        const existingSeller = await prisma.seller.findUnique({
          where: { gstin: data.gstin },
        });
        if (existingSeller) {
          throw new AppError('A seller with this GSTIN already exists', 409);
        }
      } else {
        const existingBuyer = await prisma.buyer.findUnique({
          where: { gstin: data.gstin },
        });
        if (existingBuyer) {
          throw new AppError('A buyer with this GSTIN already exists', 409);
        }
      }
    }

    // Check for existing pending referral
    const existingReferral = await prisma.sellerReferral.findFirst({
      where: {
        email: data.email,
        status: 'PENDING',
      },
    });

    if (existingReferral) {
      throw new AppError('A referral for this email is already pending', 409);
    }

    // Create referral (using SellerReferral model for both types)
    const referral = await prisma.sellerReferral.create({
      data: {
        referrerId: userId,
        email: data.email,
        companyName: data.companyName,
        gstin: data.gstin,
        contactPhone: data.contactPhone,
        status: 'PENDING',
      },
    });

    return referral;
  }

  /**
   * Auto-create mapping on first transaction (called from invoice/bid services)
   * This is a static method for easy invocation
   */
  static async autoCreateBuyerSellerMapping(buyerId: string, sellerId: string) {
    try {
      const existing = await prisma.buyerSellerMapping.findUnique({
        where: {
          buyerId_sellerId: {
            buyerId,
            sellerId,
          },
        },
      });

      if (existing) {
        // If inactive, reactivate
        if (existing.status === 'INACTIVE') {
          await prisma.buyerSellerMapping.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE' },
          });
        }
        return existing;
      }

      const mapping = await prisma.buyerSellerMapping.create({
        data: {
          buyerId,
          sellerId,
          addedBy: 'AUTO',
        },
      });

      return mapping;
    } catch (error) {
      // Log but don't throw - this is a background operation
      console.error('Failed to auto-create buyer-seller mapping:', error);
      return null;
    }
  }

  /**
   * Auto-create financier mappings on bid acceptance
   */
  static async autoCreateFinancierMappings(financierId: string, buyerId?: string, sellerId?: string) {
    try {
      if (buyerId) {
        const existing = await prisma.buyerFinancierMapping.findUnique({
          where: {
            buyerId_financierId: {
              buyerId,
              financierId,
            },
          },
        });

        if (!existing) {
          await prisma.buyerFinancierMapping.create({
            data: {
              buyerId,
              financierId,
              addedBy: 'AUTO',
            },
          });
        } else if (existing.status === 'INACTIVE') {
          await prisma.buyerFinancierMapping.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE' },
          });
        }
      }

      if (sellerId) {
        const existing = await prisma.sellerFinancierMapping.findUnique({
          where: {
            sellerId_financierId: {
              sellerId,
              financierId,
            },
          },
        });

        if (!existing) {
          await prisma.sellerFinancierMapping.create({
            data: {
              sellerId,
              financierId,
              addedBy: 'AUTO',
            },
          });
        } else if (existing.status === 'INACTIVE') {
          await prisma.sellerFinancierMapping.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE' },
          });
        }
      }
    } catch (error) {
      console.error('Failed to auto-create financier mappings:', error);
    }
  }
}

export const vendorService = new VendorService();
