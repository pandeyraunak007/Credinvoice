import { z } from 'zod';

// Create bid schema
export const createBidSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  discountRate: z.number()
    .positive('Discount rate must be positive')
    .max(100, 'Discount rate cannot exceed 100%'),
  haircutPercentage: z.number()
    .min(0, 'Haircut cannot be negative')
    .max(50, 'Haircut cannot exceed 50%')
    .default(0),
  processingFee: z.number()
    .min(0, 'Processing fee cannot be negative')
    .default(0),
  validUntil: z.string().transform((str) => new Date(str)),
}).refine(
  (data) => data.validUntil > new Date(),
  { message: 'Valid until date must be in the future', path: ['validUntil'] }
);

// Update bid schema
export const updateBidSchema = z.object({
  discountRate: z.number()
    .positive('Discount rate must be positive')
    .max(100, 'Discount rate cannot exceed 100%')
    .optional(),
  haircutPercentage: z.number()
    .min(0, 'Haircut cannot be negative')
    .max(50, 'Haircut cannot exceed 50%')
    .optional(),
  processingFee: z.number()
    .min(0, 'Processing fee cannot be negative')
    .optional(),
  validUntil: z.string().transform((str) => new Date(str)).optional(),
});

// List bids query
export const listBidsQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidInput = z.infer<typeof updateBidSchema>;
export type ListBidsQuery = z.infer<typeof listBidsQuerySchema>;
