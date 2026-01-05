import { UserType, EntityType, ProductType, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { notificationService } from '../notifications/notification.service';
import { CreateInvoiceInput, UpdateInvoiceInput, ListInvoicesQuery } from './invoice.validation';
import { extractInvoiceFromFile, getExtractedValues, InvoiceExtractionResult } from './invoice.extractor';
import { VendorService } from '../vendors/vendor.service';

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
      // Use provided sellerId first, or try to find seller by GSTIN
      if (data.sellerId) {
        sellerId = data.sellerId;
      } else if (data.sellerGstin) {
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

    // For GST_BACKED invoices created by sellers, automatically open for bidding
    // For other invoices (DD), start as DRAFT
    const initialStatus = (data.productType === 'GST_BACKED' && entityType === 'SELLER')
      ? 'OPEN_FOR_BIDDING'
      : 'DRAFT';

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
        status: initialStatus as InvoiceStatus,
        documentUrl,
      },
    });

    // Notify the other party about the uploaded invoice
    // If buyer uploaded, notify seller; if seller uploaded, notify buyer
    if (entityType === 'BUYER' && sellerId) {
      const seller = await prisma.seller.findUnique({
        where: { id: sellerId },
        select: { userId: true, companyName: true },
      });
      if (seller?.userId) {
        notificationService.notifyNewInvoice(
          seller.userId,
          data.invoiceNumber,
          data.buyerName
        ).catch(err => console.error('Failed to create invoice notification:', err));
      }
    } else if (entityType === 'SELLER' && buyerId) {
      const buyer = await prisma.buyer.findUnique({
        where: { id: buyerId },
        select: { userId: true, companyName: true },
      });
      if (buyer?.userId) {
        notificationService.createNotification({
          userId: buyer.userId,
          type: 'INVOICE_UPLOADED',
          title: 'New Invoice Uploaded',
          message: `${data.sellerName} has uploaded invoice ${data.invoiceNumber} for your review.`,
          data: { invoiceNumber: data.invoiceNumber, sellerName: data.sellerName },
        }).catch(err => console.error('Failed to create invoice notification:', err));
      }
    }

    // For GST_BACKED invoices, notify all financiers about new bidding opportunity
    if (data.productType === 'GST_BACKED' && initialStatus === 'OPEN_FOR_BIDDING') {
      const financiers = await prisma.financier.findMany({
        select: { userId: true },
      });

      for (const financier of financiers) {
        notificationService.createNotification({
          userId: financier.userId,
          type: 'NEW_INVOICE_AVAILABLE',
          title: 'New GST Financing Opportunity',
          message: `Invoice ${data.invoiceNumber} worth ₹${(data.totalAmount / 100000).toFixed(2)}L is now available for bidding.`,
          data: { invoiceId: invoice.id, invoiceNumber: data.invoiceNumber, amount: data.totalAmount },
        }).catch(err => console.error('Failed to notify financier:', err));
      }
    }

    // Auto-create buyer-seller mapping if both parties are identified
    if (buyerId && sellerId) {
      VendorService.autoCreateBuyerSellerMapping(buyerId, sellerId)
        .catch(err => console.error('Failed to auto-create buyer-seller mapping:', err));
    }

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

  // List invoices with advanced filtering
  async listInvoices(userId: string, userType: UserType, query: ListInvoicesQuery) {
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

    let where: any = {};

    if (userType !== 'ADMIN') {
      const { entityId, entityType } = await this.getEntityInfo(userId, userType);

      // Ensure entityId is valid before building query
      if (!entityId) {
        throw new AppError('Invalid user profile', 400);
      }

      switch (entityType) {
        case 'BUYER':
          // Buyer sees invoices where they are the buyer OR they uploaded
          where.OR = [
            { buyerId: entityId },
            { AND: [{ uploadedById: entityId }, { uploadedByType: 'BUYER' }] },
          ];
          break;
        case 'SELLER':
          // Seller sees ONLY invoices where they are the seller OR they uploaded
          where.OR = [
            { sellerId: entityId },
            { AND: [{ uploadedById: entityId }, { uploadedByType: 'SELLER' }] },
          ];
          break;
        case 'FINANCIER':
          // Financiers see invoices open for bidding or where they have bids
          where.OR = [
            { status: 'OPEN_FOR_BIDDING' as InvoiceStatus },
            { bids: { some: { financierId: entityId } } },
          ];
          break;
        default:
          // Unknown entity type - return no invoices for safety
          where.id = 'no-match-invalid-entity-type';
          break;
      }
    }

    // Basic filters
    if (status) where.status = status;
    if (productType) where.productType = productType;

    // Multi-field search (invoice number, seller name, buyer name)
    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { invoiceNumber: { contains: search, mode: 'insensitive' } },
            { sellerName: { contains: search, mode: 'insensitive' } },
            { buyerName: { contains: search, mode: 'insensitive' } },
            { seller: { companyName: { contains: search, mode: 'insensitive' } } },
            { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
          ],
        },
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
          buyer: { select: { id: true, companyName: true } },
          seller: { select: { id: true, companyName: true } },
          discountOffer: { select: { id: true, status: true, discountPercentage: true, fundingType: true } },
          _count: { select: { bids: true } },
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

  // Accept invoice (buyer accepts seller's invoice, or seller accepts buyer's invoice)
  async acceptInvoice(invoiceId: string, userId: string, userType: UserType) {
    const invoice = await this.getInvoice(invoiceId, userId, userType);

    if (invoice.status !== 'PENDING_ACCEPTANCE') {
      throw new AppError('Invoice is not pending acceptance', 400);
    }

    // The accepting party should be different from the uploader
    const { entityId, entityType } = await this.getEntityInfo(userId, userType);

    // Link the buyer/seller based on who's accepting
    const updateData: any = { status: 'ACCEPTED' };

    if (userType === 'BUYER' && !invoice.buyerId) {
      updateData.buyerId = entityId;
    } else if (userType === 'SELLER' && !invoice.sellerId) {
      updateData.sellerId = entityId;
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    return updated;
  }

  // Open invoice for bidding
  async openForBidding(invoiceId: string, userId: string, userType: UserType) {
    const invoice = await this.getInvoice(invoiceId, userId, userType);

    if (invoice.status !== 'ACCEPTED') {
      throw new AppError('Invoice must be accepted before opening for bidding', 400);
    }

    // Only the seller (or buyer for DD workflows) can open for bidding
    const { entityId } = await this.getEntityInfo(userId, userType);
    const canOpen =
      (userType === 'SELLER' && invoice.sellerId === entityId) ||
      (userType === 'BUYER' && invoice.buyerId === entityId);

    if (!canOpen) {
      throw new AppError('You cannot open this invoice for bidding', 403);
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'OPEN_FOR_BIDDING' },
    });

    return updated;
  }

  // Get invoices available for bidding (for financiers)
  async getAvailableForBidding(userId: string, query: { page: number; limit: number; productType?: string }) {
    const { entityId } = await this.getEntityInfo(userId, 'FINANCIER');
    const { page, limit, productType } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'OPEN_FOR_BIDDING' as InvoiceStatus,
    };

    // Filter by productType if specified
    if (productType) {
      where.productType = productType;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          buyer: { select: { id: true, companyName: true, kycStatus: true } },
          seller: { select: { id: true, companyName: true, kycStatus: true } },
          discountOffer: { select: { id: true, discountPercentage: true, earlyPaymentDate: true, status: true } },
          bids: { select: { id: true, discountRate: true, haircutPercentage: true, status: true } },
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
