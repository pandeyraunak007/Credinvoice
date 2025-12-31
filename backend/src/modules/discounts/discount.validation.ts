import { z } from 'zod';

// Create discount offer schema (fundingType is optional - set after seller accepts)
export const createDiscountOfferSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  discountPercentage: z.number()
    .positive('Discount must be positive')
    .max(50, 'Discount cannot exceed 50%'),
  earlyPaymentDate: z.string().transform((str) => new Date(str)),
  fundingType: z.enum(['SELF_FUNDED', 'FINANCIER_FUNDED']).optional(),
}).refine(
  (data) => data.earlyPaymentDate > new Date(),
  { message: 'Early payment date must be in the future', path: ['earlyPaymentDate'] }
);

// Update discount offer schema (buyer can update before seller responds)
export const updateDiscountOfferSchema = z.object({
  discountPercentage: z.number()
    .positive('Discount must be positive')
    .max(50, 'Discount cannot exceed 50%')
    .optional(),
  earlyPaymentDate: z.string().transform((str) => new Date(str)).optional(),
  fundingType: z.enum(['SELF_FUNDED', 'FINANCIER_FUNDED']).optional(),
});

// Respond to discount offer (seller)
export const respondDiscountOfferSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT']),
  rejectionReason: z.string().min(10, 'Please provide a reason').optional(),
}).refine(
  (data) => {
    if (data.action === 'REJECT' && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  { message: 'Rejection reason is required when rejecting', path: ['rejectionReason'] }
);

// Authorize payment schema (buyer self-funding)
export const authorizePaymentSchema = z.object({
  bankAccountId: z.string().uuid('Invalid bank account ID'),
});

// Select funding type schema (buyer selects after seller accepts)
export const selectFundingTypeSchema = z.object({
  fundingType: z.enum(['SELF_FUNDED', 'FINANCIER_FUNDED']),
});

// Revise rejected offer schema (buyer can revise up to 2 times)
export const reviseOfferSchema = z.object({
  discountPercentage: z.number()
    .positive('Discount must be positive')
    .max(50, 'Discount cannot exceed 50%'),
  earlyPaymentDate: z.string().transform((str) => new Date(str)),
  expiresAt: z.string().transform((str) => new Date(str)).optional(),
}).refine(
  (data) => data.earlyPaymentDate > new Date(),
  { message: 'Early payment date must be in the future', path: ['earlyPaymentDate'] }
);

// List discount offers query
export const listDiscountOffersQuerySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type CreateDiscountOfferInput = z.infer<typeof createDiscountOfferSchema>;
export type UpdateDiscountOfferInput = z.infer<typeof updateDiscountOfferSchema>;
export type RespondDiscountOfferInput = z.infer<typeof respondDiscountOfferSchema>;
export type AuthorizePaymentInput = z.infer<typeof authorizePaymentSchema>;
export type SelectFundingTypeInput = z.infer<typeof selectFundingTypeSchema>;
export type ReviseOfferInput = z.infer<typeof reviseOfferSchema>;
export type ListDiscountOffersQuery = z.infer<typeof listDiscountOffersQuerySchema>;
