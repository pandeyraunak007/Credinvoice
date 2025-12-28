import { z } from 'zod';

// Initiate disbursement (for self-funded DD)
export const initiateDisbursementSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
  transactionRef: z.string().min(1, 'Transaction reference is required').optional(),
});

// Initiate financier disbursement (after bid accepted)
export const initiateFinancierDisbursementSchema = z.object({
  bidId: z.string().uuid('Invalid bid ID'),
  transactionRef: z.string().min(1, 'Transaction reference is required').optional(),
});

// Update disbursement status
export const updateDisbursementStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'COMPLETED', 'FAILED']),
  transactionRef: z.string().optional(),
});

// Mark repayment as paid
export const markRepaymentPaidSchema = z.object({
  transactionRef: z.string().min(1, 'Transaction reference is required').optional(),
});

// List disbursements query
export const listDisbursementsQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

// List repayments query
export const listRepaymentsQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'DEFAULTED']).optional(),
  upcoming: z.string().transform((val) => val === 'true').optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type InitiateDisbursementInput = z.infer<typeof initiateDisbursementSchema>;
export type InitiateFinancierDisbursementInput = z.infer<typeof initiateFinancierDisbursementSchema>;
export type UpdateDisbursementStatusInput = z.infer<typeof updateDisbursementStatusSchema>;
export type MarkRepaymentPaidInput = z.infer<typeof markRepaymentPaidSchema>;
export type ListDisbursementsQuery = z.infer<typeof listDisbursementsQuerySchema>;
export type ListRepaymentsQuery = z.infer<typeof listRepaymentsQuerySchema>;
