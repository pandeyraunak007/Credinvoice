import { BidStatus, InvoiceStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { contractService } from '../contracts/contract.service';
import { notificationService } from '../notifications/notification.service';
import { CreateBidInput, UpdateBidInput, ListBidsQuery } from './bid.validation';

export class BidService {
  // Calculate net amount based on bid parameters
  private calculateNetAmount(
    totalAmount: number,
    discountRate: number,
    haircutPercentage: number,
    processingFee: number,
    daysEarly: number
  ): number {
    // Annualized discount rate to actual discount for the period
    const effectiveDiscount = (discountRate / 365) * daysEarly;
    const discountAmount = totalAmount * (effectiveDiscount / 100);
    const haircutAmount = totalAmount * (haircutPercentage / 100);
    return totalAmount - discountAmount - haircutAmount - processingFee;
  }

  // Create bid (Financier)
  async createBid(financierUserId: string, data: CreateBidInput) {
    const financier = await prisma.financier.findUnique({
      where: { userId: financierUserId },
    });
    if (!financier) throw new AppError('Financier profile not found', 404);

    // Get invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (invoice.status !== 'OPEN_FOR_BIDDING') {
      throw new AppError('Invoice is not open for bidding', 400);
    }

    // Check if financier already has a pending bid
    const existingBid = await prisma.bid.findFirst({
      where: {
        invoiceId: data.invoiceId,
        financierId: financier.id,
        status: 'PENDING',
      },
    });

    if (existingBid) {
      throw new AppError('You already have a pending bid on this invoice', 409);
    }

    // Calculate days until due
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const daysEarly = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate net amount
    const netAmount = this.calculateNetAmount(
      invoice.totalAmount,
      data.discountRate,
      data.haircutPercentage,
      data.processingFee,
      daysEarly
    );

    const bid = await prisma.bid.create({
      data: {
        invoiceId: data.invoiceId,
        financierId: financier.id,
        discountRate: data.discountRate,
        haircutPercentage: data.haircutPercentage,
        processingFee: data.processingFee,
        netAmount,
        validUntil: data.validUntil,
        status: 'PENDING',
      },
    });

    // Send email notification to buyer (async, don't wait)
    if (invoice.buyerId) {
      const buyer = await prisma.buyer.findUnique({
        where: { id: invoice.buyerId },
        include: { user: { select: { id: true, email: true } } },
      });

      if (buyer?.user?.email) {
        emailService.sendBidReceived(buyer.user.email, {
          buyerName: buyer.companyName || 'Buyer',
          financierName: financier.companyName || 'Financier',
          invoiceNumber: invoice.invoiceNumber,
          bidRate: data.discountRate,
          bidAmount: netAmount,
        }).catch(err => console.error('Failed to send bid notification email:', err));
      }

      // Create in-app notification for buyer
      if (buyer?.user?.id) {
        notificationService.notifyNewBid(
          buyer.user.id,
          invoice.invoiceNumber,
          financier.companyName || 'Financier',
          netAmount
        ).catch(err => console.error('Failed to create bid notification:', err));
      }
    }

    return bid;
  }

  // Get bid by ID
  async getBid(bidId: string, userId: string, userType: string) {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        invoice: {
          include: {
            buyer: { select: { id: true, companyName: true, userId: true } },
            seller: { select: { id: true, companyName: true, userId: true } },
          },
        },
        financier: { select: { id: true, companyName: true, userId: true } },
      },
    });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    // Access control
    if (userType !== 'ADMIN') {
      const hasAccess =
        bid.financier.userId === userId ||
        bid.invoice.buyer?.userId === userId ||
        bid.invoice.seller?.userId === userId;

      if (!hasAccess) {
        throw new AppError('Access denied', 403);
      }
    }

    return bid;
  }

  // Get bids for an invoice
  async getInvoiceBids(invoiceId: string, userId: string, userType: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        buyer: { select: { userId: true } },
        seller: { select: { userId: true } },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Access control - buyer, seller, or financier with bid can see
    if (userType !== 'ADMIN' &&
        invoice.buyer?.userId !== userId &&
        invoice.seller?.userId !== userId) {
      // Check if financier has a bid
      const financier = await prisma.financier.findUnique({ where: { userId } });
      if (!financier) {
        throw new AppError('Access denied', 403);
      }
      const hasBid = await prisma.bid.findFirst({
        where: { invoiceId, financierId: financier.id },
      });
      if (!hasBid) {
        throw new AppError('Access denied', 403);
      }
    }

    const bids = await prisma.bid.findMany({
      where: { invoiceId },
      include: {
        financier: { select: { id: true, companyName: true } },
      },
      orderBy: { netAmount: 'desc' }, // Highest net amount first (best for seller)
    });

    return bids;
  }

  // Get financier's bids
  async getFinancierBids(financierUserId: string, query: ListBidsQuery) {
    const financier = await prisma.financier.findUnique({
      where: { userId: financierUserId },
    });
    if (!financier) throw new AppError('Financier profile not found', 404);

    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = { financierId: financier.id };
    if (status) where.status = status;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              dueDate: true,
              sellerName: true,
              buyerName: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bid.count({ where }),
    ]);

    return {
      bids,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Update bid (Financier, while pending)
  async updateBid(bidId: string, financierUserId: string, data: UpdateBidInput) {
    const financier = await prisma.financier.findUnique({
      where: { userId: financierUserId },
    });
    if (!financier) throw new AppError('Financier profile not found', 404);

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { invoice: true },
    });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    if (bid.financierId !== financier.id) {
      throw new AppError('You can only update your own bids', 403);
    }

    if (bid.status !== 'PENDING') {
      throw new AppError('Can only update pending bids', 400);
    }

    // Recalculate net amount if parameters changed
    const discountRate = data.discountRate ?? bid.discountRate;
    const haircutPercentage = data.haircutPercentage ?? bid.haircutPercentage;
    const processingFee = data.processingFee ?? bid.processingFee;

    const now = new Date();
    const dueDate = new Date(bid.invoice.dueDate);
    const daysEarly = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const netAmount = this.calculateNetAmount(
      bid.invoice.totalAmount,
      discountRate,
      haircutPercentage,
      processingFee,
      daysEarly
    );

    const updated = await prisma.bid.update({
      where: { id: bidId },
      data: {
        discountRate: data.discountRate,
        haircutPercentage: data.haircutPercentage,
        processingFee: data.processingFee,
        validUntil: data.validUntil,
        netAmount,
      },
    });

    return updated;
  }

  // Withdraw bid (Financier)
  async withdrawBid(bidId: string, financierUserId: string) {
    const financier = await prisma.financier.findUnique({
      where: { userId: financierUserId },
    });
    if (!financier) throw new AppError('Financier profile not found', 404);

    const bid = await prisma.bid.findUnique({ where: { id: bidId } });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    if (bid.financierId !== financier.id) {
      throw new AppError('You can only withdraw your own bids', 403);
    }

    if (bid.status !== 'PENDING') {
      throw new AppError('Can only withdraw pending bids', 400);
    }

    const updated = await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'WITHDRAWN' },
    });

    return updated;
  }

  // Accept bid (Buyer or Seller depending on workflow)
  async acceptBid(bidId: string, userId: string, userType: string) {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        invoice: {
          include: {
            buyer: { select: { id: true, userId: true } },
            seller: { select: { id: true, userId: true } },
            discountOffer: true,
          },
        },
        financier: {
          select: { id: true, userId: true, companyName: true }
        },
      },
    });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    // Verify access - buyer for DD+EP, seller for GST-backed
    const canAccept =
      userType === 'ADMIN' ||
      bid.invoice.buyer?.userId === userId ||
      bid.invoice.seller?.userId === userId;

    if (!canAccept) {
      throw new AppError('You cannot accept this bid', 403);
    }

    if (bid.status !== 'PENDING') {
      throw new AppError('Bid is not pending', 400);
    }

    if (bid.invoice.status !== 'OPEN_FOR_BIDDING') {
      throw new AppError('Invoice is not open for bidding', 400);
    }

    // Accept this bid and reject others
    const result = await prisma.$transaction(async (tx) => {
      // Accept this bid
      const acceptedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      // Reject other pending bids
      await tx.bid.updateMany({
        where: {
          invoiceId: bid.invoiceId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: bid.invoiceId },
        data: { status: 'BID_SELECTED' },
      });

      return acceptedBid;
    });

    // Generate 3-party contract for financier-funded discount
    let contract = null;
    try {
      // Get buyer ID for contract generation
      const buyerId = bid.invoice.buyer?.id;
      if (buyerId) {
        contract = await contractService.generateThreePartyContract(bidId, buyerId);
      }
    } catch (err) {
      console.error('Failed to generate contract:', err);
      // Don't fail bid acceptance if contract generation fails
    }

    // Notify the winning financier that their bid was accepted
    if (bid.financier?.userId) {
      notificationService.notifyBidAccepted(
        bid.financier.userId,
        bid.invoice.invoiceNumber,
        bid.netAmount
      ).catch(err => console.error('Failed to create bid accepted notification:', err));
    }

    // Notify rejected financiers
    const rejectedBids = await prisma.bid.findMany({
      where: {
        invoiceId: bid.invoiceId,
        id: { not: bidId },
        status: 'REJECTED',
      },
      include: {
        financier: { select: { userId: true } },
      },
    });

    for (const rejectedBid of rejectedBids) {
      if (rejectedBid.financier?.userId) {
        notificationService.createNotification({
          userId: rejectedBid.financier.userId,
          type: 'BID_REJECTED',
          title: 'Bid Not Selected',
          message: `Your bid for invoice ${bid.invoice.invoiceNumber} was not selected. Another bid was chosen.`,
          data: { invoiceNumber: bid.invoice.invoiceNumber },
        }).catch(err => console.error('Failed to create bid rejected notification:', err));
      }
    }

    return { bid: result, contract };
  }
}

export const bidService = new BidService();
