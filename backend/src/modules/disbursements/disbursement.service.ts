import { DisbursementStatus, RepaymentStatus, EntityType } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { notificationService } from '../notifications/notification.service';
import {
  InitiateDisbursementInput,
  InitiateFinancierDisbursementInput,
  UpdateDisbursementStatusInput,
  MarkRepaymentPaidInput,
  ListDisbursementsQuery,
  ListRepaymentsQuery,
} from './disbursement.validation';

export class DisbursementService {
  // Initiate self-funded disbursement (Dynamic Discounting)
  async initiateSelfFundedDisbursement(buyerUserId: string, data: InitiateDisbursementInput) {
    const buyer = await prisma.buyer.findUnique({
      where: { userId: buyerUserId },
    });
    if (!buyer) throw new AppError('Buyer profile not found', 404);

    // Get invoice with discount offer
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: {
        discountOffer: true,
        seller: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    if (!invoice.discountOffer) {
      throw new AppError('No discount offer found for this invoice', 400);
    }

    if (invoice.discountOffer.buyerId !== buyer.id) {
      throw new AppError('You are not the buyer for this discount offer', 403);
    }

    if (invoice.discountOffer.status !== 'ACCEPTED') {
      throw new AppError('Discount offer must be accepted before disbursement', 400);
    }

    if (invoice.discountOffer.fundingType !== 'SELF_FUNDED') {
      throw new AppError('This endpoint is for self-funded disbursements only', 400);
    }

    // Check if disbursement already exists
    const existingDisbursement = await prisma.disbursement.findUnique({
      where: { invoiceId: data.invoiceId },
    });
    if (existingDisbursement) {
      throw new AppError('Disbursement already exists for this invoice', 409);
    }

    if (!invoice.sellerId || !invoice.seller) {
      throw new AppError('Seller not linked to invoice', 400);
    }

    // Create disbursement
    const disbursement = await prisma.$transaction(async (tx) => {
      const newDisbursement = await tx.disbursement.create({
        data: {
          invoiceId: data.invoiceId,
          payerType: 'BUYER',
          payerId: buyer.id,
          recipientType: 'SELLER',
          recipientId: invoice.sellerId!,
          amount: invoice.discountOffer!.discountedAmount,
          transactionRef: data.transactionRef,
          status: 'PENDING',
        },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { status: 'DISBURSED' },
      });

      return newDisbursement;
    });

    return disbursement;
  }

  // Initiate financier-funded disbursement (after bid accepted)
  async initiateFinancierDisbursement(financierUserId: string, data: InitiateFinancierDisbursementInput) {
    const financier = await prisma.financier.findUnique({
      where: { userId: financierUserId },
    });
    if (!financier) throw new AppError('Financier profile not found', 404);

    // Get bid with invoice
    const bid = await prisma.bid.findUnique({
      where: { id: data.bidId },
      include: {
        invoice: {
          include: {
            seller: true,
            buyer: true,
            discountOffer: true,
          },
        },
      },
    });

    if (!bid) {
      throw new AppError('Bid not found', 404);
    }

    if (bid.financierId !== financier.id) {
      throw new AppError('This bid does not belong to you', 403);
    }

    if (bid.status !== 'ACCEPTED') {
      throw new AppError('Bid must be accepted before disbursement', 400);
    }

    // Check if disbursement already exists
    const existingDisbursement = await prisma.disbursement.findUnique({
      where: { invoiceId: bid.invoiceId },
    });
    if (existingDisbursement) {
      throw new AppError('Disbursement already exists for this invoice', 409);
    }

    if (!bid.invoice.sellerId) {
      throw new AppError('Seller not linked to invoice', 400);
    }

    // Determine repayment payer based on product type
    // DD_EARLY_PAYMENT: Buyer repays financier
    // GST_BACKED: Seller repays financier
    const isEarlyPayment = bid.invoice.productType === 'DD_EARLY_PAYMENT';
    const repaymentPayerType: EntityType = isEarlyPayment ? 'BUYER' : 'SELLER';
    const repaymentPayerId = isEarlyPayment ? bid.invoice.buyerId : bid.invoice.sellerId;

    if (!repaymentPayerId) {
      throw new AppError('Repayment payer not found', 400);
    }

    // Create disbursement and repayment
    const result = await prisma.$transaction(async (tx) => {
      const newDisbursement = await tx.disbursement.create({
        data: {
          invoiceId: bid.invoiceId,
          bidId: data.bidId,
          payerType: 'FINANCIER',
          payerId: financier.id,
          financierId: financier.id,
          recipientType: 'SELLER',
          recipientId: bid.invoice.sellerId!,
          amount: bid.netAmount,
          transactionRef: data.transactionRef,
          status: 'PENDING',
        },
      });

      // Create repayment record (due on invoice due date)
      const repayment = await tx.repayment.create({
        data: {
          disbursementId: newDisbursement.id,
          dueDate: bid.invoice.dueDate,
          amount: bid.invoice.totalAmount, // Full amount to be repaid
          payerType: repaymentPayerType,
          payerId: repaymentPayerId,
          status: 'PENDING',
        },
      });

      // Update invoice status
      await tx.invoice.update({
        where: { id: bid.invoiceId },
        data: { status: 'DISBURSED' },
      });

      return { disbursement: newDisbursement, repayment };
    });

    return result;
  }

  // Update disbursement status (Admin or Financier)
  async updateDisbursementStatus(
    disbursementId: string,
    userId: string,
    userType: string,
    data: UpdateDisbursementStatusInput
  ) {
    const disbursement = await prisma.disbursement.findUnique({
      where: { id: disbursementId },
      include: { financier: true },
    });

    if (!disbursement) {
      throw new AppError('Disbursement not found', 404);
    }

    // Access control
    if (userType !== 'ADMIN') {
      if (disbursement.financierId) {
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (!financier || financier.id !== disbursement.financierId) {
          throw new AppError('You cannot update this disbursement', 403);
        }
      } else {
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (!buyer || buyer.id !== disbursement.payerId) {
          throw new AppError('You cannot update this disbursement', 403);
        }
      }
    }

    const updateData: any = { status: data.status };
    if (data.transactionRef) updateData.transactionRef = data.transactionRef;
    if (data.status === 'COMPLETED') updateData.disbursedAt = new Date();

    const updated = await prisma.disbursement.update({
      where: { id: disbursementId },
      data: updateData,
      include: {
        invoice: {
          include: {
            seller: { include: { user: { select: { email: true } } } },
            buyer: { include: { user: { select: { email: true } } } },
          },
        },
      },
    });

    // Send payment notification to seller when disbursement is completed
    if (data.status === 'COMPLETED') {
      const seller = updated.invoice.seller;
      if (seller?.user?.email) {
        // Get financier name if applicable
        let payerName = updated.invoice.buyer?.companyName || 'Buyer';
        if (updated.financierId) {
          const fin = await prisma.financier.findUnique({ where: { id: updated.financierId } });
          payerName = fin?.companyName || 'Financier';
        }

        emailService.sendPaymentDisbursed(seller.user.email, {
          recipientName: seller.companyName || 'Seller',
          invoiceNumber: updated.invoice.invoiceNumber,
          amount: updated.amount,
          payerName,
        }).catch(err => console.error('Failed to send payment notification email:', err));
      }

      // Create in-app notification for seller
      if (seller?.userId) {
        notificationService.notifyDisbursement(
          seller.userId,
          updated.invoice.invoiceNumber,
          updated.amount
        ).catch(err => console.error('Failed to create disbursement notification:', err));
      }

      // Also notify buyer about the disbursement
      if (updated.invoice.buyer?.userId) {
        notificationService.createNotification({
          userId: updated.invoice.buyer.userId,
          type: 'FUNDS_DISBURSED',
          title: 'Funds Disbursed',
          message: `Funds of ₹${updated.amount.toLocaleString()} have been disbursed to ${seller?.companyName || 'the seller'} for invoice ${updated.invoice.invoiceNumber}.`,
          data: { invoiceNumber: updated.invoice.invoiceNumber, amount: updated.amount },
        }).catch(err => console.error('Failed to create buyer disbursement notification:', err));
      }
    }

    return updated;
  }

  // Get disbursement by ID
  async getDisbursement(disbursementId: string, userId: string, userType: string) {
    const disbursement = await prisma.disbursement.findUnique({
      where: { id: disbursementId },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            dueDate: true,
            sellerName: true,
            buyerName: true,
          },
        },
        bid: {
          select: {
            id: true,
            discountRate: true,
            netAmount: true,
          },
        },
        financier: {
          select: { id: true, companyName: true },
        },
        repayment: true,
      },
    });

    if (!disbursement) {
      throw new AppError('Disbursement not found', 404);
    }

    // Access control
    if (userType !== 'ADMIN') {
      let hasAccess = false;

      // Check if user is the payer/recipient/financier
      if (disbursement.financierId) {
        const financier = await prisma.financier.findUnique({ where: { userId } });
        if (financier && financier.id === disbursement.financierId) hasAccess = true;
      }

      if (disbursement.payerType === 'BUYER') {
        const buyer = await prisma.buyer.findUnique({ where: { userId } });
        if (buyer && buyer.id === disbursement.payerId) hasAccess = true;
      }

      if (disbursement.recipientType === 'SELLER') {
        const seller = await prisma.seller.findUnique({ where: { userId } });
        if (seller && seller.id === disbursement.recipientId) hasAccess = true;
      }

      if (!hasAccess) {
        throw new AppError('Access denied', 403);
      }
    }

    return disbursement;
  }

  // List disbursements for user
  async listDisbursements(userId: string, userType: string, query: ListDisbursementsQuery) {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    // Filter by user role
    if (userType === 'BUYER') {
      const buyer = await prisma.buyer.findUnique({ where: { userId } });
      if (!buyer) throw new AppError('Buyer profile not found', 404);
      where.payerId = buyer.id;
      where.payerType = 'BUYER';
    } else if (userType === 'SELLER') {
      const seller = await prisma.seller.findUnique({ where: { userId } });
      if (!seller) throw new AppError('Seller profile not found', 404);
      where.recipientId = seller.id;
      where.recipientType = 'SELLER';
    } else if (userType === 'FINANCIER') {
      const financier = await prisma.financier.findUnique({ where: { userId } });
      if (!financier) throw new AppError('Financier profile not found', 404);
      where.financierId = financier.id;
    }
    // ADMIN sees all

    if (status) where.status = status;

    const [disbursements, total] = await Promise.all([
      prisma.disbursement.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              totalAmount: true,
              sellerName: true,
              buyerName: true,
            },
          },
          repayment: {
            select: { id: true, status: true, dueDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.disbursement.count({ where }),
    ]);

    return {
      disbursements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Get upcoming repayments
  async getUpcomingRepayments(userId: string, userType: string, query: ListRepaymentsQuery) {
    const { status, upcoming, page, limit } = query;
    const skip = (page - 1) * limit;

    let where: any = {};

    // Filter by user role
    if (userType === 'BUYER') {
      const buyer = await prisma.buyer.findUnique({ where: { userId } });
      if (!buyer) throw new AppError('Buyer profile not found', 404);
      where.payerId = buyer.id;
      where.payerType = 'BUYER';
    } else if (userType === 'SELLER') {
      const seller = await prisma.seller.findUnique({ where: { userId } });
      if (!seller) throw new AppError('Seller profile not found', 404);
      where.payerId = seller.id;
      where.payerType = 'SELLER';
    } else if (userType === 'FINANCIER') {
      // Financier sees repayments for their disbursements
      const financier = await prisma.financier.findUnique({ where: { userId } });
      if (!financier) throw new AppError('Financier profile not found', 404);
      where.disbursement = { financierId: financier.id };
    }
    // ADMIN sees all

    if (status) where.status = status;
    if (upcoming) {
      where.status = 'PENDING';
      where.dueDate = { gte: new Date() };
    }

    const [repayments, total] = await Promise.all([
      prisma.repayment.findMany({
        where,
        include: {
          disbursement: {
            include: {
              invoice: {
                select: {
                  id: true,
                  invoiceNumber: true,
                  sellerName: true,
                  buyerName: true,
                },
              },
              financier: {
                select: { id: true, companyName: true },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.repayment.count({ where }),
    ]);

    return {
      repayments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Mark repayment as paid
  async markRepaymentPaid(
    repaymentId: string,
    userId: string,
    userType: string,
    data: MarkRepaymentPaidInput
  ) {
    const repayment = await prisma.repayment.findUnique({
      where: { id: repaymentId },
      include: {
        disbursement: {
          include: {
            financier: { include: { user: { select: { id: true } } } },
            invoice: {
              include: {
                buyer: { select: { userId: true, companyName: true } },
                seller: { select: { userId: true, companyName: true } },
              },
            },
          },
        },
      },
    });

    if (!repayment) {
      throw new AppError('Repayment not found', 404);
    }

    // Access control - only admin or financier can mark as paid
    if (userType !== 'ADMIN') {
      if (!repayment.disbursement.financierId) {
        throw new AppError('Only admin can mark self-funded repayments', 403);
      }
      const financier = await prisma.financier.findUnique({ where: { userId } });
      if (!financier || financier.id !== repayment.disbursement.financierId) {
        throw new AppError('You cannot mark this repayment as paid', 403);
      }
    }

    if (repayment.status === 'PAID') {
      throw new AppError('Repayment is already marked as paid', 400);
    }

    // Update repayment and invoice status
    const result = await prisma.$transaction(async (tx) => {
      const updatedRepayment = await tx.repayment.update({
        where: { id: repaymentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Update invoice to settled
      await tx.invoice.update({
        where: { id: repayment.disbursement.invoiceId },
        data: { status: 'SETTLED' },
      });

      return updatedRepayment;
    });

    const invoice = repayment.disbursement.invoice;
    const invoiceNumber = invoice.invoiceNumber;

    // Notify financier that repayment was received
    if (repayment.disbursement.financier?.user?.id) {
      notificationService.createNotification({
        userId: repayment.disbursement.financier.user.id,
        type: 'REPAYMENT_RECEIVED',
        title: 'Repayment Received',
        message: `Repayment of ₹${repayment.amount.toLocaleString()} for invoice ${invoiceNumber} has been received. The transaction is now complete.`,
        data: { invoiceNumber, amount: repayment.amount },
      }).catch(err => console.error('Failed to create repayment received notification:', err));
    }

    // Notify buyer that invoice is settled
    if (invoice.buyer?.userId) {
      notificationService.createNotification({
        userId: invoice.buyer.userId,
        type: 'REPAYMENT_RECEIVED',
        title: 'Invoice Settled',
        message: `Invoice ${invoiceNumber} has been settled. The repayment has been completed.`,
        data: { invoiceNumber },
      }).catch(err => console.error('Failed to create buyer settlement notification:', err));
    }

    // Notify seller that invoice is settled
    if (invoice.seller?.userId) {
      notificationService.createNotification({
        userId: invoice.seller.userId,
        type: 'REPAYMENT_RECEIVED',
        title: 'Invoice Settled',
        message: `Invoice ${invoiceNumber} has been fully settled.`,
        data: { invoiceNumber },
      }).catch(err => console.error('Failed to create seller settlement notification:', err));
    }

    return result;
  }

  // Check and update overdue repayments (can be called by cron job)
  async updateOverdueRepayments() {
    const now = new Date();

    const result = await prisma.repayment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    });

    return { updatedCount: result.count };
  }
}

export const disbursementService = new DisbursementService();
