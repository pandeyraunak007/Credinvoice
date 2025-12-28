import { DiscountOfferStatus, FundingType, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import {
  CreateDiscountOfferInput,
  UpdateDiscountOfferInput,
  RespondDiscountOfferInput,
  ListDiscountOffersQuery,
} from './discount.validation';

export class DiscountService {
  // Create discount offer (Buyer creates for Seller)
  async createDiscountOffer(buyerUserId: string, data: CreateDiscountOfferInput) {
    // Get buyer
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
    if (!buyer) throw new AppError('Buyer profile not found', 404);

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { discountOffer: true },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Verify buyer owns this invoice or is the buyer on the invoice
    if (invoice.buyerId !== buyer.id && invoice.uploadedById !== buyer.id) {
      throw new AppError('You can only create discount offers for your invoices', 403);
    }

    // Check invoice status
    if (invoice.status !== 'DRAFT' && invoice.status !== 'PENDING_ACCEPTANCE') {
      throw new AppError('Invoice is not in a valid state for discount offers', 400);
    }

    // Check if discount offer already exists
    if (invoice.discountOffer) {
      throw new AppError('A discount offer already exists for this invoice', 409);
    }

    // Calculate discounted amount
    const discountAmount = invoice.totalAmount * (data.discountPercentage / 100);
    const discountedAmount = invoice.totalAmount - discountAmount;

    // Create discount offer
    const discountOffer = await prisma.$transaction(async (tx) => {
      const offer = await tx.discountOffer.create({
        data: {
          invoiceId: data.invoiceId,
          buyerId: buyer.id,
          discountPercentage: data.discountPercentage,
          discountedAmount,
          earlyPaymentDate: data.earlyPaymentDate,
          fundingType: data.fundingType as FundingType,
          status: 'PENDING',
        },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { status: 'PENDING_ACCEPTANCE' },
      });

      return offer;
    });

    return discountOffer;
  }

  // Get discount offer by ID
  async getDiscountOffer(offerId: string, userId: string, userType: string) {
    const offer = await prisma.discountOffer.findUnique({
      where: { id: offerId },
      include: {
        invoice: {
          include: {
            buyer: { select: { id: true, companyName: true, userId: true } },
            seller: { select: { id: true, companyName: true, userId: true } },
          },
        },
        buyer: { select: { id: true, companyName: true, userId: true } },
      },
    });

    if (!offer) {
      throw new AppError('Discount offer not found', 404);
    }

    // Access control
    if (userType !== 'ADMIN') {
      const hasAccess =
        offer.buyer.userId === userId ||
        offer.invoice.seller?.userId === userId;

      if (!hasAccess) {
        throw new AppError('Access denied', 403);
      }
    }

    return offer;
  }

  // List discount offers for seller (pending offers)
  async getSellerPendingOffers(sellerUserId: string, query: ListDiscountOffersQuery) {
    const seller = await prisma.seller.findUnique({ where: { userId: sellerUserId } });
    if (!seller) throw new AppError('Seller profile not found', 404);

    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      invoice: { sellerId: seller.id },
    };
    if (status) where.status = status;
    else where.status = 'PENDING';

    const [offers, total] = await Promise.all([
      prisma.discountOffer.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              dueDate: true,
              buyerName: true,
            },
          },
          buyer: { select: { id: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.discountOffer.count({ where }),
    ]);

    return {
      offers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // List discount offers for buyer (offers they created)
  async getBuyerOffers(buyerUserId: string, query: ListDiscountOffersQuery) {
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
    if (!buyer) throw new AppError('Buyer profile not found', 404);

    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = { buyerId: buyer.id };
    if (status) where.status = status;

    const [offers, total] = await Promise.all([
      prisma.discountOffer.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              dueDate: true,
              sellerName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.discountOffer.count({ where }),
    ]);

    return {
      offers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Update discount offer (buyer, before seller responds)
  async updateDiscountOffer(
    offerId: string,
    buyerUserId: string,
    data: UpdateDiscountOfferInput
  ) {
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
    if (!buyer) throw new AppError('Buyer profile not found', 404);

    const offer = await prisma.discountOffer.findUnique({
      where: { id: offerId },
      include: { invoice: true },
    });

    if (!offer) {
      throw new AppError('Discount offer not found', 404);
    }

    if (offer.buyerId !== buyer.id) {
      throw new AppError('You can only update your own offers', 403);
    }

    if (offer.status !== 'PENDING') {
      throw new AppError('Can only update pending offers', 400);
    }

    // Calculate new discounted amount if percentage changed
    let discountedAmount = offer.discountedAmount;
    if (data.discountPercentage) {
      const discountAmount = offer.invoice.totalAmount * (data.discountPercentage / 100);
      discountedAmount = offer.invoice.totalAmount - discountAmount;
    }

    const updated = await prisma.discountOffer.update({
      where: { id: offerId },
      data: {
        discountPercentage: data.discountPercentage,
        discountedAmount,
        earlyPaymentDate: data.earlyPaymentDate,
        fundingType: data.fundingType as FundingType,
      },
    });

    return updated;
  }

  // Seller responds to discount offer
  async respondToOffer(
    offerId: string,
    sellerUserId: string,
    input: RespondDiscountOfferInput
  ) {
    const seller = await prisma.seller.findUnique({ where: { userId: sellerUserId } });
    if (!seller) throw new AppError('Seller profile not found', 404);

    const offer = await prisma.discountOffer.findUnique({
      where: { id: offerId },
      include: { invoice: true },
    });

    if (!offer) {
      throw new AppError('Discount offer not found', 404);
    }

    if (offer.invoice.sellerId !== seller.id) {
      throw new AppError('This offer is not for you', 403);
    }

    if (offer.status !== 'PENDING') {
      throw new AppError('This offer has already been responded to', 400);
    }

    const newStatus = input.action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    const newInvoiceStatus = input.action === 'ACCEPT'
      ? (offer.fundingType === 'SELF_FUNDED' ? 'ACCEPTED' : 'OPEN_FOR_BIDDING')
      : 'REJECTED';

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOffer = await tx.discountOffer.update({
        where: { id: offerId },
        data: {
          status: newStatus as DiscountOfferStatus,
          respondedAt: new Date(),
        },
      });

      await tx.invoice.update({
        where: { id: offer.invoiceId },
        data: { status: newInvoiceStatus as InvoiceStatus },
      });

      return updatedOffer;
    });

    return updated;
  }

  // Cancel discount offer (buyer)
  async cancelOffer(offerId: string, buyerUserId: string) {
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
    if (!buyer) throw new AppError('Buyer profile not found', 404);

    const offer = await prisma.discountOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new AppError('Discount offer not found', 404);
    }

    if (offer.buyerId !== buyer.id) {
      throw new AppError('You can only cancel your own offers', 403);
    }

    if (offer.status !== 'PENDING') {
      throw new AppError('Can only cancel pending offers', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.discountOffer.update({
        where: { id: offerId },
        data: { status: 'CANCELLED' },
      });

      await tx.invoice.update({
        where: { id: offer.invoiceId },
        data: { status: 'DRAFT' },
      });

      return cancelled;
    });

    return updated;
  }

  // Authorize self-funded payment (buyer)
  async authorizePayment(offerId: string, buyerUserId: string, bankAccountId: string) {
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerUserId } });
    if (!buyer) throw new AppError('Buyer profile not found', 404);

    const offer = await prisma.discountOffer.findUnique({
      where: { id: offerId },
      include: { invoice: { include: { seller: true } } },
    });

    if (!offer) {
      throw new AppError('Discount offer not found', 404);
    }

    if (offer.buyerId !== buyer.id) {
      throw new AppError('You can only authorize your own offers', 403);
    }

    if (offer.status !== 'ACCEPTED') {
      throw new AppError('Offer must be accepted before authorizing payment', 400);
    }

    if (offer.fundingType !== 'SELF_FUNDED') {
      throw new AppError('This offer is not self-funded', 400);
    }

    // Verify bank account ownership
    const bankAccount = await prisma.bankAccount.findFirst({
      where: {
        id: bankAccountId,
        buyerId: buyer.id,
      },
    });

    if (!bankAccount) {
      throw new AppError('Bank account not found', 404);
    }

    // Create disbursement
    const disbursement = await prisma.$transaction(async (tx) => {
      const disb = await tx.disbursement.create({
        data: {
          invoiceId: offer.invoiceId,
          payerType: 'BUYER',
          payerId: buyer.id,
          recipientType: 'SELLER',
          recipientId: offer.invoice.sellerId!,
          amount: offer.discountedAmount,
          status: 'PENDING',
        },
      });

      await tx.invoice.update({
        where: { id: offer.invoiceId },
        data: { status: 'DISBURSED' },
      });

      return disb;
    });

    return disbursement;
  }
}

export const discountService = new DiscountService();
