import { z } from 'zod';

// List users query
export const listUsersQuerySchema = z.object({
  userType: z.enum(['BUYER', 'SELLER', 'FINANCIER', 'ADMIN']).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED']).optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

// List invoices query (admin view)
export const listInvoicesQuerySchema = z.object({
  status: z.enum([
    'DRAFT',
    'PENDING_ACCEPTANCE',
    'ACCEPTED',
    'REJECTED',
    'OPEN_FOR_BIDDING',
    'BID_SELECTED',
    'DISBURSED',
    'SETTLED',
    'DISPUTED',
    'CANCELLED',
  ]).optional(),
  productType: z.enum(['DYNAMIC_DISCOUNTING', 'DD_EARLY_PAYMENT', 'GST_BACKED']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

// List audit logs query
export const listAuditLogsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('50'),
});

// Update user status
export const updateUserStatusSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED']),
  reason: z.string().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
