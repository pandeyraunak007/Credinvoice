import { z } from 'zod';

// Create notification (internal use)
export const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum([
    'KYC_SUBMITTED',
    'KYC_APPROVED',
    'KYC_REJECTED',
    'INVOICE_UPLOADED',
    'NEW_INVOICE_AVAILABLE',
    'DISCOUNT_OFFER_RECEIVED',
    'DISCOUNT_ACCEPTED',
    'DISCOUNT_REJECTED',
    'BID_RECEIVED',
    'BID_ACCEPTED',
    'BID_REJECTED',
    'FUNDS_DISBURSED',
    'REPAYMENT_DUE',
    'REPAYMENT_RECEIVED',
    'CONTRACT_GENERATED',
    'SYSTEM_ALERT',
  ]),
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  data: z.record(z.any()).optional(),
});

// List notifications query
export const listNotificationsQuerySchema = z.object({
  unreadOnly: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
