import { z } from 'zod';

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

// Invoice extraction result (from AI)
export const extractedInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().transform((str) => new Date(str)),
  dueDate: z.string().transform((str) => new Date(str)),
  sellerGstin: z.string().regex(gstinRegex, 'Invalid seller GSTIN').optional().nullable(),
  sellerName: z.string().min(1, 'Seller name is required'),
  buyerGstin: z.string().regex(gstinRegex, 'Invalid buyer GSTIN').optional().nullable(),
  buyerName: z.string().min(1, 'Buyer name is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
  totalAmount: z.number().positive('Total amount must be positive'),
});

// Create invoice schema
export const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().transform((str) => new Date(str)),
  dueDate: z.string().transform((str) => new Date(str)),
  sellerGstin: z.string().regex(gstinRegex, 'Invalid seller GSTIN').optional().nullable(),
  sellerName: z.string().min(1, 'Seller name is required'),
  sellerId: z.string().uuid().optional().nullable(), // Direct seller ID for proper linking
  buyerGstin: z.string().regex(gstinRegex, 'Invalid buyer GSTIN').optional().nullable(),
  buyerName: z.string().min(1, 'Buyer name is required'),
  subtotal: z.number().positive('Subtotal must be positive'),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
  totalAmount: z.number().positive('Total amount must be positive'),
  productType: z.enum(['DYNAMIC_DISCOUNTING', 'DD_EARLY_PAYMENT', 'GST_BACKED']),
  documentUrl: z.string().optional(),
}).refine(
  (data) => data.dueDate > data.invoiceDate,
  { message: 'Due date must be after invoice date', path: ['dueDate'] }
).refine(
  (data) => Math.abs(data.totalAmount - (data.subtotal + data.taxAmount)) < 1,
  { message: 'Total amount must equal subtotal + tax amount', path: ['totalAmount'] }
);

// Update invoice schema (draft only)
export const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required').optional(),
  invoiceDate: z.string().transform((str) => new Date(str)).optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  sellerGstin: z.string().regex(gstinRegex, 'Invalid seller GSTIN').optional().nullable(),
  sellerName: z.string().min(1, 'Seller name is required').optional(),
  buyerGstin: z.string().regex(gstinRegex, 'Invalid buyer GSTIN').optional().nullable(),
  buyerName: z.string().min(1, 'Buyer name is required').optional(),
  subtotal: z.number().positive('Subtotal must be positive').optional(),
  taxAmount: z.number().min(0, 'Tax amount cannot be negative').optional(),
  totalAmount: z.number().positive('Total amount must be positive').optional(),
});

// List invoices query
export const listInvoicesQuerySchema = z.object({
  status: z.enum([
    'DRAFT', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'REJECTED',
    'OPEN_FOR_BIDDING', 'BID_SELECTED', 'DISBURSED', 'SETTLED', 'DISPUTED', 'CANCELLED'
  ]).optional(),
  productType: z.enum(['DYNAMIC_DISCOUNTING', 'DD_EARLY_PAYMENT', 'GST_BACKED']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type ExtractedInvoiceInput = z.infer<typeof extractedInvoiceSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
