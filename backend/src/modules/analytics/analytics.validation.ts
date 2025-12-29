import { z } from 'zod';

// Period validation - used across all analytics endpoints
export const periodSchema = z.enum(['week', 'month', 'quarter', 'year']).default('month');

export const groupBySchema = z.enum(['day', 'week', 'month']).default('week');

// Common query schema
export const analyticsQuerySchema = z.object({
  period: periodSchema,
  groupBy: groupBySchema.optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

// Buyer-specific queries
export const buyerAnalyticsQuerySchema = analyticsQuerySchema.extend({
  sellerId: z.string().uuid().optional(),
  fundingType: z.enum(['SELF_FUNDED', 'FINANCIER_FUNDED']).optional(),
});

export type BuyerAnalyticsQuery = z.infer<typeof buyerAnalyticsQuerySchema>;

// Seller-specific queries
export const sellerAnalyticsQuerySchema = analyticsQuerySchema.extend({
  buyerId: z.string().uuid().optional(),
});

export type SellerAnalyticsQuery = z.infer<typeof sellerAnalyticsQuerySchema>;

// Financier-specific queries
export const financierAnalyticsQuerySchema = analyticsQuerySchema.extend({
  productType: z.enum(['DD_EARLY_PAYMENT', 'GST_BACKED']).optional(),
});

export type FinancierAnalyticsQuery = z.infer<typeof financierAnalyticsQuerySchema>;

// Admin-specific queries
export const adminAnalyticsQuerySchema = analyticsQuerySchema.extend({
  userType: z.enum(['BUYER', 'SELLER', 'FINANCIER']).optional(),
});

export type AdminAnalyticsQuery = z.infer<typeof adminAnalyticsQuerySchema>;

// Helper to get date range from period
export function getDateRangeFromPeriod(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    default:
      start.setMonth(end.getMonth() - 1);
  }

  // Set start to beginning of day and end to end of day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// Helper to get previous period for comparison
export function getPreviousPeriodRange(period: string): { start: Date; end: Date } {
  const current = getDateRangeFromPeriod(period);
  const duration = current.end.getTime() - current.start.getTime();

  return {
    start: new Date(current.start.getTime() - duration),
    end: new Date(current.start.getTime() - 1),
  };
}
