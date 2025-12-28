import { NotificationType } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateNotificationInput, ListNotificationsQuery } from './notification.validation';

export class NotificationService {
  // Create notification (internal)
  async createNotification(data: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as NotificationType,
        title: data.title,
        message: data.message,
        data: data.data ? JSON.stringify(data.data) : null,
      },
    });

    return notification;
  }

  // Create notifications for multiple users
  async createBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      })),
    });

    return { count: notifications.count };
  }

  // Get user's notifications
  async getUserNotifications(userId: string, query: ListNotificationsQuery) {
    const { unreadOnly, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    // Parse JSON data
    const parsed = notifications.map((n) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    }));

    return {
      notifications: parsed,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { markedCount: result.count };
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    return { deleted: true };
  }

  // Helper: Send notification for common events
  async notifyKycStatusChange(userId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const type = status === 'APPROVED' ? 'KYC_APPROVED' : 'KYC_REJECTED';
    const title = status === 'APPROVED' ? 'KYC Approved' : 'KYC Rejected';
    const message =
      status === 'APPROVED'
        ? 'Your KYC documents have been approved. You can now access all platform features.'
        : `Your KYC documents have been rejected. ${reason || 'Please re-submit with correct documents.'}`;

    return this.createNotification({
      userId,
      type,
      title,
      message,
      data: reason ? { reason } : undefined,
    });
  }

  async notifyNewInvoice(sellerUserId: string, invoiceNumber: string, buyerName: string) {
    return this.createNotification({
      userId: sellerUserId,
      type: 'INVOICE_UPLOADED',
      title: 'New Invoice Uploaded',
      message: `Invoice ${invoiceNumber} from ${buyerName} has been uploaded and needs your acceptance.`,
      data: { invoiceNumber, buyerName },
    });
  }

  async notifyDiscountOffer(sellerUserId: string, invoiceNumber: string, discountPercentage: number) {
    return this.createNotification({
      userId: sellerUserId,
      type: 'DISCOUNT_OFFER_RECEIVED',
      title: 'Discount Offer Received',
      message: `You received a ${discountPercentage}% discount offer for invoice ${invoiceNumber}. Review and respond.`,
      data: { invoiceNumber, discountPercentage },
    });
  }

  async notifyNewBid(
    invoiceOwnerUserId: string,
    invoiceNumber: string,
    financierName: string,
    netAmount: number
  ) {
    return this.createNotification({
      userId: invoiceOwnerUserId,
      type: 'BID_RECEIVED',
      title: 'New Bid Received',
      message: `${financierName} placed a bid of ₹${netAmount.toLocaleString()} for invoice ${invoiceNumber}.`,
      data: { invoiceNumber, financierName, netAmount },
    });
  }

  async notifyBidAccepted(financierUserId: string, invoiceNumber: string, netAmount: number) {
    return this.createNotification({
      userId: financierUserId,
      type: 'BID_ACCEPTED',
      title: 'Bid Accepted',
      message: `Your bid of ₹${netAmount.toLocaleString()} for invoice ${invoiceNumber} has been accepted.`,
      data: { invoiceNumber, netAmount },
    });
  }

  async notifyDisbursement(sellerUserId: string, invoiceNumber: string, amount: number) {
    return this.createNotification({
      userId: sellerUserId,
      type: 'FUNDS_DISBURSED',
      title: 'Funds Disbursed',
      message: `₹${amount.toLocaleString()} has been disbursed for invoice ${invoiceNumber}.`,
      data: { invoiceNumber, amount },
    });
  }

  async notifyRepaymentDue(payerUserId: string, invoiceNumber: string, amount: number, dueDate: Date) {
    return this.createNotification({
      userId: payerUserId,
      type: 'REPAYMENT_DUE',
      title: 'Repayment Due Soon',
      message: `Repayment of ₹${amount.toLocaleString()} for invoice ${invoiceNumber} is due on ${dueDate.toLocaleDateString()}.`,
      data: { invoiceNumber, amount, dueDate },
    });
  }
}

export const notificationService = new NotificationService();
