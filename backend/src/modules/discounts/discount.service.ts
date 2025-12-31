import { DiscountOfferStatus, FundingType, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { contractService } from '../contracts/contract.service';
import {
  CreateDiscountOfferInput,
  UpdateDiscountOfferInput,
  RespondDiscountOfferInput,
  SelectFundingTypeInput,
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

    // Create discount offer (fundingType is optional - buyer selects after seller accepts)
    const discountOffer = await prisma.$transaction(async (tx) => {
      const offer = await tx.discountOffer.create({
        data: {
          invoiceId: data.invoiceId,
          buyerId: buyer.id,
          discountPercentage: data.discountPercentage,
          discountedAmount,
          earlyPaymentDate: data.earlyPaymentDate,
          fundingType: data.fundingType ? (data.fundingType as FundingType) : null,
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

    // Send email notification to seller (async, don't wait)
    if (invoice.sellerId) {
      const seller = await prisma.seller.findUnique({
        where: { id: invoice.sellerId },
        include: { user: { select: { email: true } } },
      });

      if (seller?.user?.email) {
        emailService.sendDiscountOfferReceived(seller.user.email, {
          sellerName: seller.companyName || 'Seller',
          buyerName: buyer.companyName || 'Buyer',
          invoiceNumber: invoice.invoiceNumber,
          originalAmount: invoice.totalAmount,
          discountedAmount,
          discountPercentage: data.discountPercentage,
          expiresAt: data.earlyPaymentDate,
        }).catch(err => console.error('Failed to send discount offer email:', err));
      }
    }

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

    // Check if offer has expired
    if (offer.expiresAt && new Date() > offer.expiresAt) {
      throw new AppError('This offer has expired', 400);
    }

    const newStatus = input.action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    // When seller accepts, invoice goes to ACCEPTED status
    // When rejected, invoice stays at PENDING_ACCEPTANCE so buyer can revise (if revisions remaining)
    const canRevise = offer.revisionCount < 2;
    const newInvoiceStatus = input.action === 'ACCEPT'
      ? 'ACCEPTED'
      : (canRevise ? 'PENDING_ACCEPTANCE' : 'REJECTED');

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOffer = await tx.discountOffer.update({
        where: { id: offerId },
        data: {
          status: newStatus as DiscountOfferStatus,
          rejectionReason: input.action === 'REJECT' ? input.rejectionReason : null,
          respondedAt: new Date(),
        },
      });

      await tx.invoice.update({
        where: { id: offer.invoiceId },
        data: { status: newInvoiceStatus as InvoiceStatus },
      });

      return updatedOffer;
    });

    // Send email notification to buyer (async, don't wait)
    const buyerWithUser = await prisma.buyer.findUnique({
      where: { id: offer.buyerId },
      include: { user: { select: { email: true } } },
    });

    if (buyerWithUser?.user?.email) {
      if (input.action === 'ACCEPT') {
        emailService.sendDiscountOfferAccepted(buyerWithUser.user.email, {
          buyerName: buyerWithUser.companyName || 'Buyer',
          sellerName: seller.companyName || 'Seller',
          invoiceNumber: offer.invoice.invoiceNumber,
          discountedAmount: offer.discountedAmount,
        }).catch(err => console.error('Failed to send offer accepted email:', err));
      } else {
        emailService.sendDiscountOfferRejected(buyerWithUser.user.email, {
          buyerName: buyerWithUser.companyName || 'Buyer',
          sellerName: seller.companyName || 'Seller',
          invoiceNumber: offer.invoice.invoiceNumber,
          reason: input.rejectionReason,
          canRevise,
          revisionsRemaining: 2 - offer.revisionCount,
        }).catch(err => console.error('Failed to send offer rejected email:', err));
      }
    }

    return { ...updated, canRevise, revisionsRemaining: 2 - offer.revisionCount };
  }

  // Buyer revises a rejected discount offer
  async reviseOffer(
    offerId: string,
    buyerUserId: string,
    data: { discountPercentage: number; earlyPaymentDate: string; expiresAt?: string }
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
      throw new AppError('You can only revise your own offers', 403);
    }

    if (offer.status !== 'REJECTED') {
      throw new AppError('Can only revise rejected offers', 400);
    }

    // Check revision limit (max 2 revisions allowed)
    if (offer.revisionCount >= 2) {
      throw new AppError('Maximum revision limit (2) reached. No more revisions allowed.', 400);
    }

    // Calculate new discounted amount
    const discountAmount = offer.invoice.totalAmount * (data.discountPercentage / 100);
    const discountedAmount = offer.invoice.totalAmount - discountAmount;

    // Set expiry (default 72 hours if not provided)
    const expiresAt = data.expiresAt
      ? new Date(data.expiresAt)
      : new Date(Date.now() + 72 * 60 * 60 * 1000);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOffer = await tx.discountOffer.update({
        where: { id: offerId },
        data: {
          discountPercentage: data.discountPercentage,
          discountedAmount,
          earlyPaymentDate: new Date(data.earlyPaymentDate),
          expiresAt,
          status: 'PENDING',
          rejectionReason: null,
          revisionCount: offer.revisionCount + 1,
          respondedAt: null,
        },
      });

      // Ensure invoice is in PENDING_ACCEPTANCE
      await tx.invoice.update({
        where: { id: offer.invoiceId },
        data: { status: 'PENDING_ACCEPTANCE' },
      });

      return updatedOffer;
    });

    // Notify seller about revised offer
    if (offer.invoice.sellerId) {
      const seller = await prisma.seller.findUnique({
        where: { id: offer.invoice.sellerId },
        include: { user: { select: { email: true } } },
      });

      if (seller?.user?.email) {
        emailService.sendDiscountOfferReceived(seller.user.email, {
          sellerName: seller.companyName || 'Seller',
          buyerName: buyer.companyName || 'Buyer',
          invoiceNumber: offer.invoice.invoiceNumber,
          originalAmount: offer.invoice.totalAmount,
          discountedAmount,
          discountPercentage: data.discountPercentage,
          expiresAt: expiresAt,
          isRevision: true,
          revisionNumber: offer.revisionCount + 1,
        }).catch(err => console.error('Failed to send revised offer email:', err));
      }
    }

    return updated;
  }

  // Check and mark expired offers
  async checkExpiredOffers() {
    const now = new Date();

    const result = await prisma.discountOffer.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    // Also update corresponding invoices
    const expiredOffers = await prisma.discountOffer.findMany({
      where: { status: 'EXPIRED' },
      select: { invoiceId: true },
    });

    if (expiredOffers.length > 0) {
      await prisma.invoice.updateMany({
        where: {
          id: { in: expiredOffers.map(o => o.invoiceId) },
          status: 'PENDING_ACCEPTANCE',
        },
        data: { status: 'DRAFT' },
      });
    }

    return { expiredCount: result.count };
  }

  // Buyer selects funding type after seller accepts the offer
  async selectFundingType(
    offerId: string,
    buyerUserId: string,
    input: SelectFundingTypeInput
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
      throw new AppError('You can only select funding type for your own offers', 403);
    }

    if (offer.status !== 'ACCEPTED') {
      throw new AppError('Can only select funding type for accepted offers', 400);
    }

    if (offer.invoice.status !== 'ACCEPTED') {
      throw new AppError('Invoice must be in ACCEPTED status', 400);
    }

    // If funding type already set and invoice has progressed, don't allow change
    if (offer.fundingType && offer.invoice.status !== 'ACCEPTED') {
      throw new AppError('Funding type has already been selected and cannot be changed', 400);
    }

    const newInvoiceStatus = input.fundingType === 'SELF_FUNDED'
      ? 'ACCEPTED'  // Stay at ACCEPTED, buyer will authorize payment
      : 'OPEN_FOR_BIDDING';  // Open for financiers to bid

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOffer = await tx.discountOffer.update({
        where: { id: offerId },
        data: {
          fundingType: input.fundingType as FundingType,
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

    // Generate 2-party contract for self-funded discount
    let contract = null;
    try {
      contract = await contractService.generateTwoPartyContract(offerId, buyer.id);
    } catch (err) {
      console.error('Failed to generate contract:', err);
      // Don't fail the disbursement if contract generation fails
    }

    return { disbursement, contract };
  }
}

export const discountService = new DiscountService();
