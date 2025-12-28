import { UserType, EntityType, ProductType, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateInvoiceInput, UpdateInvoiceInput, ListInvoicesQuery } from './invoice.validation';
import { extractInvoiceFromFile, getExtractedValues, InvoiceExtractionResult } from './invoice.extractor';

export class InvoiceService {
  // Get entity info based on user type
  private async getEntityInfo(userId: string, userType: UserType): Promise<{
    entityId: string;
    entityType: EntityType;
    companyName: string;
  }> {
    switch (userType) {
      case 'BUYER': {
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (!buyer) throw new AppError('Buyer profile not found', 404);
        return { entityId: buyer.id, entityType: 'BUYER', companyName: buyer.companyName };
      }
      case 'SELLER': {
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (!seller) throw new AppError('Seller profile not found', 404);
        return { entityId: seller.id, entityType: 'SELLER', companyName: seller.companyName };
      }
      case 'FINANCIER': {
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (!financier) throw new AppError('Financier profile not found', 404);
        return { entityId: financier.id, entityType: 'FINANCIER', companyName: financier.companyName };
      }
      default:
        throw new AppError('Invalid user type', 400);
    }
  }

  // Extract invoice data from uploaded file
  async extractInvoice(
    userId: string,
    userType: UserType,
    file: Express.Multer.File
  ): Promise<InvoiceExtractionResult> {
    const { companyName } = await this.getEntityInfo(userId, userType);

    const result = await extractInvoiceFromFile(file.path, {
      type: userType,
      name: companyName,
    });

    return result;
  }

  // Create invoice
  async createInvoice(
    userId: string,
    userType: UserType,
    data: CreateInvoiceInput,
    documentUrl?: string
  ) {
    const { entityId, entityType } = await this.getEntityInfo(userId, userType);

    // Check for duplicate invoice
    const existing = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: data.invoiceNumber,
        sellerGstin: data.sellerGstin,
      },
    });

    if (existing) {
      throw new AppError('Invoice with this number and seller GSTIN already exists', 409);
    }

    // Determine buyer/seller IDs based on who's uploading
    let buyerId: string | null = null;
    let sellerId: string | null = null;

    if (entityType === 'BUYER') {
      buyerId = entityId;
      // Try to find seller by GSTIN
      if (data.sellerGstin) {
        const seller = await prisma.seller.findUnique({ where: { gstin: data.sellerGstin } });
        sellerId = seller?.id || null;
      }
    } else if (entityType === 'SELLER') {
      sellerId = entityId;
      // Try to find buyer by GSTIN
      if (data.buyerGstin) {
        const buyer = await prisma.buyer.findUnique({ where: { gstin: data.buyerGstin } });
        buyerId = buyer?.id || null;
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        sellerGstin: data.sellerGstin,
        sellerName: data.sellerName,
        buyerGstin: data.buyerGstin,
        buyerName: data.buyerName,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        uploadedByType: entityType,
        uploadedById: entityId,
        buyerId,
        sellerId,
        productType: data.productType as ProductType,
        status: 'DRAFT',
        documentUrl,
      },
    });

    return invoice;
  }

  // Get invoice by ID
  async getInvoice(invoiceId: string, userId: string, userType: UserType) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        buyer: {
          select: { id: true, companyName: true, gstin: true, kycStatus: true },
        },
        seller: {
          select: { id: true, companyName: true, gstin: true, kycStatus: true },
        },
        discountOffer: true,
        bids: {
          include: {
            financier: {
              select: { id: true, companyName: true },
            },
          },
        },
        disbursement: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Access control
    if (userType !== 'ADMIN') {
      const { entityId, entityType } = await this.getEntityInfo(userId, userType);
      const hasAccess = this.checkInvoiceAccess(invoice, entityId, entityType);
      if (!hasAccess) {
        throw new AppError('Access denied', 403);
      }
    }

    return invoice;
  }

  // Check if user has access to invoice
  private checkInvoiceAccess(invoice: any, entityId: string, entityType: EntityType): boolean {
    switch (entityType) {
      case 'BUYER':
        return invoice.buyerId === entityId || invoice.uploadedById === entityId;
      case 'SELLER':
        return invoice.sellerId === entityId || invoice.uploadedById === entityId;
      case 'FINANCIER':
        // Financiers can access invoices open for bidding or where they have a bid
        return invoice.status === 'OPEN_FOR_BIDDING' ||
               invoice.bids?.some((b: any) => b.financierId === entityId);
      default:
        return false;
    }
  }

  // List invoices
  async listInvoices(userId: string, userType: UserType, query: ListInvoicesQuery) {
    const { status, productType, page, limit } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (userType !== 'ADMIN') {
      const { entityId, entityType } = await this.getEntityInfo(userId, userType);

      switch (entityType) {
        case 'BUYER':
          where.OR = [
            { buyerId: entityId },
            { uploadedById: entityId, uploadedByType: 'BUYER' },
          ];
          break;
        case 'SELLER':
          where.OR = [
            { sellerId: entityId },
            { uploadedById: entityId, uploadedByType: 'SELLER' },
          ];
          break;
        case 'FINANCIER':
          // Financiers see invoices open for bidding or their bids
          where.OR = [
            { status: 'OPEN_FOR_BIDDING' },
            { bids: { some: { financierId: entityId } } },
          ];
          break;
      }
    }

    if (status) where.status = status;
    if (productType) where.productType = productType;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          buyer: { select: { id: true, companyName: true } },
          seller: { select: { id: true, companyName: true } },
          discountOffer: { select: { id: true, status: true, discountPercentage: true } },
          _count: { select: { bids: true } },
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

  // Update invoice (draft only)
  async updateInvoice(invoiceId: string, userId: string, userType: UserType, data: UpdateInvoiceInput) {
    const invoice = await this.getInvoice(invoiceId, userId, userType);

    if (invoice.status !== 'DRAFT') {
      throw new AppError('Can only update draft invoices', 400);
    }

    // Verify ownership
    const { entityId } = await this.getEntityInfo(userId, userType);
    if (invoice.uploadedById !== entityId) {
      throw new AppError('Only the uploader can update this invoice', 403);
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        sellerGstin: data.sellerGstin,
        sellerName: data.sellerName,
        buyerGstin: data.buyerGstin,
        buyerName: data.buyerName,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
      },
    });

    return updated;
  }

  // Delete invoice (draft only)
  async deleteInvoice(invoiceId: string, userId: string, userType: UserType) {
    const invoice = await this.getInvoice(invoiceId, userId, userType);

    if (invoice.status !== 'DRAFT') {
      throw new AppError('Can only delete draft invoices', 400);
    }

    const { entityId } = await this.getEntityInfo(userId, userType);
    if (invoice.uploadedById !== entityId) {
      throw new AppError('Only the uploader can delete this invoice', 403);
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });

    return { message: 'Invoice deleted successfully' };
  }

  // Submit invoice (move from DRAFT to PENDING_ACCEPTANCE)
  async submitInvoice(invoiceId: string, userId: string, userType: UserType) {
    const invoice = await this.getInvoice(invoiceId, userId, userType);

    if (invoice.status !== 'DRAFT') {
      throw new AppError('Can only submit draft invoices', 400);
    }

    const { entityId } = await this.getEntityInfo(userId, userType);
    if (invoice.uploadedById !== entityId) {
      throw new AppError('Only the uploader can submit this invoice', 403);
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PENDING_ACCEPTANCE' },
    });

    return updated;
  }

  // Get invoices available for bidding (for financiers)
  async getAvailableForBidding(userId: string, query: { page: number; limit: number }) {
    const { entityId } = await this.getEntityInfo(userId, 'FINANCIER');
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      status: 'OPEN_FOR_BIDDING' as InvoiceStatus,
      // Could add: financier must be mapped to buyer/seller
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          buyer: { select: { id: true, companyName: true, kycStatus: true } },
          seller: { select: { id: true, companyName: true, kycStatus: true } },
          _count: { select: { bids: true } },
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
}

export const invoiceService = new InvoiceService();
