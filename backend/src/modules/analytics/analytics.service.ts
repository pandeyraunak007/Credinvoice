import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  getDateRangeFromPeriod,
  getPreviousPeriodRange,
} from './analytics.validation';

// Helper to convert Prisma Decimal to number
const toNum = (val: Prisma.Decimal | number | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  return typeof val === 'number' ? val : Number(val);
};

export class AnalyticsService {
  // ============================================
  // BUYER ANALYTICS
  // ============================================

  // Buyer Summary KPIs
  async getBuyerSummary(buyerId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const prevRange = getPreviousPeriodRange(period);

    // Get buyer entity ID
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    const [
      currentInvoices,
      previousInvoices,
      discountSavings,
      prevDiscountSavings,
      pendingPayments,
      fundingBreakdown,
    ] = await Promise.all([
      // Current period invoices
      prisma.invoice.aggregate({
        where: {
          buyerId: buyer.id,
          createdAt: { gte: start, lte: end },
        },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      // Previous period invoices (for trend)
      prisma.invoice.aggregate({
        where: {
          buyerId: buyer.id,
          createdAt: { gte: prevRange.start, lte: prevRange.end },
        },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      // Discount savings (from accepted discount offers)
      prisma.discountOffer.aggregate({
        where: {
          invoice: { buyerId: buyer.id },
          status: 'ACCEPTED',
          createdAt: { gte: start, lte: end },
        },
        _sum: { discountedAmount: true },
        _avg: { discountPercentage: true },
      }),
      // Previous discount savings
      prisma.discountOffer.aggregate({
        where: {
          invoice: { buyerId: buyer.id },
          status: 'ACCEPTED',
          createdAt: { gte: prevRange.start, lte: prevRange.end },
        },
        _sum: { discountedAmount: true },
      }),
      // Pending payments (upcoming repayments)
      prisma.repayment.aggregate({
        where: {
          disbursement: { invoice: { buyerId: buyer.id } },
          status: 'PENDING',
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
      // Funding breakdown
      prisma.discountOffer.groupBy({
        by: ['fundingType'],
        where: {
          invoice: { buyerId: buyer.id },
          status: 'ACCEPTED',
          createdAt: { gte: start, lte: end },
        },
        _count: { id: true },
        _sum: { discountedAmount: true },
      }),
    ]);

    // Calculate trends
    const invoiceTrend = previousInvoices._count.id
      ? ((currentInvoices._count.id - previousInvoices._count.id) / previousInvoices._count.id) * 100
      : 0;

    const currentSavings = toNum(discountSavings._sum.discountedAmount);
    const prevSavings = toNum(prevDiscountSavings._sum.discountedAmount);
    const savingsTrend = prevSavings
      ? ((currentSavings - prevSavings) / prevSavings) * 100
      : 0;

    return {
      period: { start, end },
      invoices: {
        total: currentInvoices._count.id,
        value: toNum(currentInvoices._sum.totalAmount),
        trend: Math.round(invoiceTrend * 10) / 10,
      },
      savings: {
        total: currentSavings,
        avgRate: Math.round(toNum(discountSavings._avg.discountPercentage) * 100) / 100,
        trend: Math.round(savingsTrend * 10) / 10,
      },
      payments: {
        pending: pendingPayments._count.id,
        amount: toNum(pendingPayments._sum.amount),
      },
      funding: fundingBreakdown.reduce(
        (acc, item) => {
          acc[item.fundingType || 'UNKNOWN'] = {
            count: item._count.id,
            value: toNum(item._sum.discountedAmount),
          };
          return acc;
        },
        {} as Record<string, { count: number; value: number }>
      ),
    };
  }

  // Buyer Invoice Trends
  async getBuyerInvoiceTrends(buyerId: string, period: string, groupBy: string = 'week') {
    const { start, end } = getDateRangeFromPeriod(period);
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    // Get all invoices in the period
    const invoices = await prisma.invoice.findMany({
      where: {
        buyerId: buyer.id,
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by period
    const grouped = this.groupByTimePeriod(invoices, groupBy, 'createdAt');

    return {
      period: { start, end },
      trends: grouped.map((g) => ({
        date: g.date,
        count: g.items.length,
        value: g.items.reduce((sum, inv) => sum + toNum(inv.totalAmount), 0),
      })),
    };
  }

  // Buyer Discount Savings
  async getBuyerDiscountSavings(buyerId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    const discountOffers = await prisma.discountOffer.findMany({
      where: {
        invoice: { buyerId: buyer.id },
        status: 'ACCEPTED',
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        discountPercentage: true,
        discountedAmount: true,
        fundingType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = this.groupByTimePeriod(discountOffers, 'month', 'createdAt');

    return {
      period: { start, end },
      trends: grouped.map((g) => ({
        date: g.date,
        count: g.items.length,
        savings: g.items.reduce((sum, d) => sum + toNum(d.discountedAmount), 0),
        avgRate: g.items.length
          ? g.items.reduce((sum, d) => sum + toNum(d.discountPercentage), 0) / g.items.length
          : 0,
      })),
    };
  }

  // Buyer Seller Performance
  async getBuyerSellerPerformance(buyerId: string, period: string, limit: number = 10) {
    const { start, end } = getDateRangeFromPeriod(period);
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    const sellerStats = await prisma.invoice.groupBy({
      by: ['sellerId'],
      where: {
        buyerId: buyer.id,
        createdAt: { gte: start, lte: end },
        sellerId: { not: null },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    // Get seller names - filter out null IDs
    const sellerIds = sellerStats
      .map((s) => s.sellerId)
      .filter((id): id is string => id !== null);

    const sellers = await prisma.seller.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, companyName: true },
    });

    const sellerMap = new Map(sellers.map((s) => [s.id, s.companyName]));

    return {
      period: { start, end },
      sellers: sellerStats
        .filter((s) => s.sellerId !== null)
        .map((s) => ({
          sellerId: s.sellerId,
          name: sellerMap.get(s.sellerId!) || 'Unknown',
          invoiceCount: s._count.id,
          totalValue: toNum(s._sum.totalAmount),
        })),
    };
  }

  // Buyer Funding Breakdown
  async getBuyerFundingBreakdown(buyerId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const buyer = await prisma.buyer.findUnique({ where: { userId: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    const breakdown = await prisma.discountOffer.groupBy({
      by: ['fundingType'],
      where: {
        invoice: { buyerId: buyer.id },
        status: 'ACCEPTED',
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _sum: { discountedAmount: true },
    });

    return {
      period: { start, end },
      breakdown: breakdown.map((b) => ({
        type: b.fundingType,
        name: b.fundingType === 'SELF_FUNDED' ? 'Self Funded' : 'Financier Funded',
        count: b._count.id,
        value: toNum(b._sum.discountedAmount),
      })),
    };
  }

  // ============================================
  // SELLER ANALYTICS
  // ============================================

  async getSellerSummary(sellerId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const prevRange = getPreviousPeriodRange(period);

    const seller = await prisma.seller.findUnique({ where: { userId: sellerId } });
    if (!seller) throw new Error('Seller not found');

    const [currentRevenue, previousRevenue, pendingOffers, disbursements] = await Promise.all([
      // Current period disbursements received
      prisma.disbursement.aggregate({
        where: {
          invoice: { sellerId: seller.id },
          status: 'COMPLETED',
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Previous period
      prisma.disbursement.aggregate({
        where: {
          invoice: { sellerId: seller.id },
          status: 'COMPLETED',
          createdAt: { gte: prevRange.start, lte: prevRange.end },
        },
        _sum: { amount: true },
      }),
      // Pending discount offers
      prisma.discountOffer.aggregate({
        where: {
          invoice: { sellerId: seller.id },
          status: 'PENDING',
        },
        _count: { id: true },
        _sum: { discountedAmount: true },
      }),
      // Active financing
      prisma.disbursement.aggregate({
        where: {
          invoice: { sellerId: seller.id },
          repayment: { status: 'PENDING' },
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const currentRev = toNum(currentRevenue._sum.amount);
    const prevRev = toNum(previousRevenue._sum.amount);
    const revenueTrend = prevRev ? ((currentRev - prevRev) / prevRev) * 100 : 0;

    return {
      period: { start, end },
      revenue: {
        total: currentRev,
        count: currentRevenue._count.id,
        trend: Math.round(revenueTrend * 10) / 10,
      },
      pendingOffers: {
        count: pendingOffers._count.id,
        value: toNum(pendingOffers._sum.discountedAmount),
      },
      activeFinancing: {
        count: disbursements._count.id,
        value: toNum(disbursements._sum.amount),
      },
    };
  }

  async getSellerRevenueTrends(sellerId: string, period: string, groupBy: string = 'week') {
    const { start, end } = getDateRangeFromPeriod(period);
    const seller = await prisma.seller.findUnique({ where: { userId: sellerId } });
    if (!seller) throw new Error('Seller not found');

    const disbursements = await prisma.disbursement.findMany({
      where: {
        invoice: { sellerId: seller.id },
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = this.groupByTimePeriod(disbursements, groupBy, 'createdAt');

    return {
      period: { start, end },
      trends: grouped.map((g) => ({
        date: g.date,
        count: g.items.length,
        revenue: g.items.reduce((sum, d) => sum + toNum(d.amount), 0),
      })),
    };
  }

  async getSellerDiscountAnalysis(sellerId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const seller = await prisma.seller.findUnique({ where: { userId: sellerId } });
    if (!seller) throw new Error('Seller not found');

    const analysis = await prisma.discountOffer.groupBy({
      by: ['status'],
      where: {
        invoice: { sellerId: seller.id },
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _sum: { discountedAmount: true },
    });

    return {
      period: { start, end },
      analysis: analysis.map((a) => ({
        status: a.status,
        count: a._count.id,
        value: toNum(a._sum.discountedAmount),
      })),
    };
  }

  async getSellerBuyerMetrics(sellerId: string, period: string, limit: number = 10) {
    const { start, end } = getDateRangeFromPeriod(period);
    const seller = await prisma.seller.findUnique({ where: { userId: sellerId } });
    if (!seller) throw new Error('Seller not found');

    const buyerStats = await prisma.invoice.groupBy({
      by: ['buyerId'],
      where: {
        sellerId: seller.id,
        createdAt: { gte: start, lte: end },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    // Filter out any null buyer IDs and get buyer names
    const validBuyerIds = buyerStats
      .map((b) => b.buyerId)
      .filter((id): id is string => id !== null);
    const buyers = await prisma.buyer.findMany({
      where: { id: { in: validBuyerIds } },
      select: { id: true, companyName: true },
    });

    const buyerMap = new Map(buyers.map((b) => [b.id, b.companyName]));

    return {
      period: { start, end },
      buyers: buyerStats
        .filter((b) => b.buyerId !== null)
        .map((b) => ({
          buyerId: b.buyerId,
          name: buyerMap.get(b.buyerId!) || 'Unknown',
          invoiceCount: b._count.id,
          totalValue: toNum(b._sum.totalAmount),
        })),
    };
  }

  // ============================================
  // FINANCIER ANALYTICS
  // ============================================

  async getFinancierSummary(financierId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const prevRange = getPreviousPeriodRange(period);

    const financier = await prisma.financier.findUnique({ where: { userId: financierId } });
    if (!financier) throw new Error('Financier not found');

    const [activePortfolio, disbursed, collected, overdue, prevDisbursed] = await Promise.all([
      // Active portfolio
      prisma.disbursement.aggregate({
        where: {
          financierId: financier.id,
          repayment: { status: 'PENDING' },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Disbursed this period
      prisma.disbursement.aggregate({
        where: {
          financierId: financier.id,
          status: 'COMPLETED',
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Collected this period
      prisma.repayment.aggregate({
        where: {
          disbursement: { financierId: financier.id },
          status: 'PAID',
          paidAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Overdue
      prisma.repayment.aggregate({
        where: {
          disbursement: { financierId: financier.id },
          status: 'OVERDUE',
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // Previous period disbursed
      prisma.disbursement.aggregate({
        where: {
          financierId: financier.id,
          status: 'COMPLETED',
          createdAt: { gte: prevRange.start, lte: prevRange.end },
        },
        _sum: { amount: true },
      }),
    ]);

    const disbursedAmt = toNum(disbursed._sum.amount);
    const prevDisbursedAmt = toNum(prevDisbursed._sum.amount);
    const disbursedTrend = prevDisbursedAmt
      ? ((disbursedAmt - prevDisbursedAmt) / prevDisbursedAmt) * 100
      : 0;

    return {
      period: { start, end },
      portfolio: {
        active: toNum(activePortfolio._sum.amount),
        count: activePortfolio._count.id,
      },
      disbursed: {
        total: disbursedAmt,
        count: disbursed._count.id,
        trend: Math.round(disbursedTrend * 10) / 10,
      },
      collected: {
        total: toNum(collected._sum.amount),
        count: collected._count.id,
      },
      overdue: {
        total: toNum(overdue._sum.amount),
        count: overdue._count.id,
      },
    };
  }

  async getFinancierPortfolioTrends(financierId: string, period: string, groupBy: string = 'week') {
    const { start, end } = getDateRangeFromPeriod(period);
    const financier = await prisma.financier.findUnique({ where: { userId: financierId } });
    if (!financier) throw new Error('Financier not found');

    const disbursements = await prisma.disbursement.findMany({
      where: {
        financierId: financier.id,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = this.groupByTimePeriod(disbursements, groupBy, 'createdAt');

    return {
      period: { start, end },
      trends: grouped.map((g) => ({
        date: g.date,
        count: g.items.length,
        disbursed: g.items.reduce((sum, d) => sum + toNum(d.amount), 0),
      })),
    };
  }

  async getFinancierYieldAnalysis(financierId: string, period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const financier = await prisma.financier.findUnique({ where: { userId: financierId } });
    if (!financier) throw new Error('Financier not found');

    const bids = await prisma.bid.findMany({
      where: {
        financierId: financier.id,
        status: 'ACCEPTED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        invoice: { select: { productType: true } },
      },
    });

    // Group by product type
    const byProduct: Record<string, { count: number; totalRate: number }> = {};
    bids.forEach((bid) => {
      const type = bid.invoice.productType;
      if (!byProduct[type]) byProduct[type] = { count: 0, totalRate: 0 };
      byProduct[type].count++;
      byProduct[type].totalRate += toNum(bid.discountRate);
    });

    return {
      period: { start, end },
      overall: {
        avgYield: bids.length
          ? bids.reduce((sum, b) => sum + toNum(b.discountRate), 0) / bids.length
          : 0,
        totalBids: bids.length,
      },
      byProduct: Object.entries(byProduct).map(([type, data]) => ({
        productType: type,
        avgYield: data.count ? data.totalRate / data.count : 0,
        count: data.count,
      })),
    };
  }

  async getFinancierSectorBreakdown(financierId: string) {
    const financier = await prisma.financier.findUnique({ where: { userId: financierId } });
    if (!financier) throw new Error('Financier not found');

    const disbursements = await prisma.disbursement.findMany({
      where: {
        financierId: financier.id,
        repayment: { status: 'PENDING' },
      },
      include: {
        invoice: {
          include: {
            seller: { select: { businessType: true } },
          },
        },
      },
    });

    // Group by business type
    const bySector: Record<string, { count: number; value: number }> = {};
    disbursements.forEach((d) => {
      const sector = d.invoice.seller?.businessType || 'Other';
      if (!bySector[sector]) bySector[sector] = { count: 0, value: 0 };
      bySector[sector].count++;
      bySector[sector].value += toNum(d.amount);
    });

    return {
      sectors: Object.entries(bySector).map(([sector, data]) => ({
        name: sector,
        count: data.count,
        value: data.value,
      })),
    };
  }

  // ============================================
  // ADMIN ANALYTICS
  // ============================================

  async getAdminPlatformSummary(period: string) {
    const { start, end } = getDateRangeFromPeriod(period);
    const prevRange = getPreviousPeriodRange(period);

    const [users, invoices, disbursements, prevUsers] = await Promise.all([
      prisma.user.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.invoice.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
      prisma.disbursement.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.user.aggregate({
        where: { createdAt: { gte: prevRange.start, lte: prevRange.end } },
        _count: { id: true },
      }),
    ]);

    const userTrend = prevUsers._count.id
      ? ((users._count.id - prevUsers._count.id) / prevUsers._count.id) * 100
      : 0;

    return {
      period: { start, end },
      users: {
        newUsers: users._count.id,
        trend: Math.round(userTrend * 10) / 10,
      },
      invoices: {
        count: invoices._count.id,
        value: toNum(invoices._sum.totalAmount),
      },
      transactions: {
        count: disbursements._count.id,
        value: toNum(disbursements._sum.amount),
      },
    };
  }

  async getAdminUserGrowth(period: string, groupBy: string = 'week') {
    const { start, end } = getDateRangeFromPeriod(period);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, userType: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = this.groupByTimePeriod(users, groupBy, 'createdAt');

    return {
      period: { start, end },
      trends: grouped.map((g) => {
        const byType: Record<string, number> = {};
        g.items.forEach((u) => {
          byType[u.userType] = (byType[u.userType] || 0) + 1;
        });
        return {
          date: g.date,
          total: g.items.length,
          ...byType,
        };
      }),
    };
  }

  async getAdminKycFunnel(period: string) {
    const { start, end } = getDateRangeFromPeriod(period);

    // Execute all queries separately and await them
    const [
      registered,
      buyerSubmitted,
      sellerSubmitted,
      financierSubmitted,
      buyerApproved,
      sellerApproved,
      financierApproved,
      buyerRejected,
      sellerRejected,
      financierRejected,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.buyer.count({
        where: {
          kycStatus: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.seller.count({
        where: {
          kycStatus: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.financier.count({
        where: {
          kycStatus: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.buyer.count({
        where: { kycStatus: 'APPROVED', createdAt: { gte: start, lte: end } },
      }),
      prisma.seller.count({
        where: { kycStatus: 'APPROVED', createdAt: { gte: start, lte: end } },
      }),
      prisma.financier.count({
        where: { kycStatus: 'APPROVED', createdAt: { gte: start, lte: end } },
      }),
      prisma.buyer.count({
        where: { kycStatus: 'REJECTED', createdAt: { gte: start, lte: end } },
      }),
      prisma.seller.count({
        where: { kycStatus: 'REJECTED', createdAt: { gte: start, lte: end } },
      }),
      prisma.financier.count({
        where: { kycStatus: 'REJECTED', createdAt: { gte: start, lte: end } },
      }),
    ]);

    return {
      period: { start, end },
      funnel: [
        { stage: 'Registered', count: registered },
        { stage: 'KYC Submitted', count: buyerSubmitted + sellerSubmitted + financierSubmitted },
        { stage: 'KYC Approved', count: buyerApproved + sellerApproved + financierApproved },
        { stage: 'KYC Rejected', count: buyerRejected + sellerRejected + financierRejected },
      ],
    };
  }

  async getAdminInvoiceDistribution(period: string) {
    const { start, end } = getDateRangeFromPeriod(period);

    const [byStatus, byProduct] = await Promise.all([
      prisma.invoice.groupBy({
        by: ['status'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.invoice.groupBy({
        by: ['productType'],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      period: { start, end },
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      byProduct: byProduct.map((p) => ({
        productType: p.productType,
        count: p._count.id,
        value: toNum(p._sum.totalAmount),
      })),
    };
  }

  // ============================================
  // PERFORMANCE METRICS
  // ============================================

  /**
   * Calculate and update seller performance metrics
   * Based on how their invoices are paid (on-time vs late)
   */
  async calculateSellerMetrics(sellerId: string) {
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) throw new Error('Seller not found');

    // Get all settled invoices for this seller
    const settledInvoices = await prisma.invoice.findMany({
      where: {
        sellerId: seller.id,
        status: 'SETTLED',
      },
      include: {
        disbursement: {
          include: {
            repayment: true,
          },
        },
      },
    });

    let onTimeCount = 0;
    let lateCount = 0;
    let totalDaysToPayment = 0;
    let validPayments = 0;

    for (const invoice of settledInvoices) {
      const repayment = invoice.disbursement?.repayment;
      if (repayment && repayment.paidAt) {
        validPayments++;
        const daysToPayment = Math.ceil(
          (new Date(repayment.paidAt).getTime() - new Date(invoice.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        totalDaysToPayment += daysToPayment;

        // Check if paid on time (before or on due date)
        if (new Date(repayment.paidAt) <= new Date(repayment.dueDate)) {
          onTimeCount++;
        } else {
          lateCount++;
        }
      }
    }

    const totalSettled = settledInvoices.length;
    const avgDaysToPayment = validPayments > 0 ? totalDaysToPayment / validPayments : null;

    // Performance score calculation:
    // 60% on-time rate + 20% volume (capped at 20 for max points) + 20% consistency
    const onTimeRate = totalSettled > 0 ? (onTimeCount / totalSettled) * 100 : 0;
    const volumeScore = Math.min((totalSettled / 20) * 100, 100); // Max 100 at 20+ invoices
    const consistencyScore = avgDaysToPayment
      ? Math.max(0, 100 - avgDaysToPayment) // Lower days = higher score
      : 50; // Default middle score

    const performanceScore = onTimeRate * 0.6 + volumeScore * 0.2 + consistencyScore * 0.2;

    // Update seller metrics
    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        totalInvoicesSettled: totalSettled,
        onTimePayments: onTimeCount,
        latePayments: lateCount,
        avgDaysToPayment,
        performanceScore: Math.round(performanceScore * 10) / 10,
        lastMetricsUpdate: new Date(),
      },
    });

    return {
      sellerId: seller.id,
      totalInvoicesSettled: totalSettled,
      onTimePayments: onTimeCount,
      latePayments: lateCount,
      avgDaysToPayment,
      performanceScore: Math.round(performanceScore * 10) / 10,
    };
  }

  /**
   * Calculate and update buyer reliability metrics
   * Based on how promptly they pay sellers/financiers
   */
  async calculateBuyerMetrics(buyerId: string) {
    const buyer = await prisma.buyer.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    // Get all repayments where buyer is the payer
    const repayments = await prisma.repayment.findMany({
      where: {
        payerType: 'BUYER',
        payerId: buyer.id,
        status: { in: ['PAID', 'OVERDUE'] },
      },
    });

    let onTimeCount = 0;
    let lateCount = 0;
    let totalDaysToPayment = 0;
    let validPayments = 0;

    for (const repayment of repayments) {
      if (repayment.paidAt) {
        validPayments++;
        const daysToPayment = Math.ceil(
          (new Date(repayment.paidAt).getTime() - new Date(repayment.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        totalDaysToPayment += Math.abs(daysToPayment);

        if (new Date(repayment.paidAt) <= new Date(repayment.dueDate)) {
          onTimeCount++;
        } else {
          lateCount++;
        }
      }
    }

    const totalPaid = repayments.filter((r) => r.status === 'PAID').length;
    const avgDaysToPayment = validPayments > 0 ? totalDaysToPayment / validPayments : null;
    const onTimePaymentRate = totalPaid > 0 ? (onTimeCount / totalPaid) * 100 : null;

    // Reliability score calculation:
    // 70% on-time rate + 15% volume + 15% consistency
    const onTimeRate = onTimePaymentRate || 0;
    const volumeScore = Math.min((totalPaid / 10) * 100, 100); // Max 100 at 10+ payments
    const consistencyScore = avgDaysToPayment !== null
      ? Math.max(0, 100 - avgDaysToPayment * 5) // Penalize late days more heavily
      : 50;

    const reliabilityScore = onTimeRate * 0.7 + volumeScore * 0.15 + consistencyScore * 0.15;

    // Update buyer metrics
    await prisma.buyer.update({
      where: { id: buyer.id },
      data: {
        totalInvoicesPaid: totalPaid,
        onTimePayments: onTimeCount,
        latePayments: lateCount,
        onTimePaymentRate,
        avgDaysToPayment,
        reliabilityScore: Math.round(reliabilityScore * 10) / 10,
        lastMetricsUpdate: new Date(),
      },
    });

    return {
      buyerId: buyer.id,
      totalInvoicesPaid: totalPaid,
      onTimePayments: onTimeCount,
      latePayments: lateCount,
      onTimePaymentRate,
      avgDaysToPayment,
      reliabilityScore: Math.round(reliabilityScore * 10) / 10,
    };
  }

  /**
   * Get seller performance metrics (cached from DB)
   */
  async getSellerMetrics(sellerId: string) {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        companyName: true,
        totalInvoicesSettled: true,
        onTimePayments: true,
        latePayments: true,
        avgDaysToPayment: true,
        performanceScore: true,
        lastMetricsUpdate: true,
      },
    });

    if (!seller) throw new Error('Seller not found');

    // Calculate on-time rate
    const total = seller.totalInvoicesSettled || 0;
    const onTimeRate = total > 0 ? ((seller.onTimePayments || 0) / total) * 100 : null;

    return {
      sellerId: seller.id,
      companyName: seller.companyName,
      totalInvoicesSettled: seller.totalInvoicesSettled,
      onTimePayments: seller.onTimePayments,
      latePayments: seller.latePayments,
      onTimeRate: onTimeRate ? Math.round(onTimeRate * 10) / 10 : null,
      avgDaysToPayment: seller.avgDaysToPayment,
      performanceScore: seller.performanceScore,
      lastMetricsUpdate: seller.lastMetricsUpdate,
    };
  }

  /**
   * Get buyer reliability metrics (cached from DB)
   */
  async getBuyerMetrics(buyerId: string) {
    const buyer = await prisma.buyer.findUnique({
      where: { id: buyerId },
      select: {
        id: true,
        companyName: true,
        totalInvoicesPaid: true,
        onTimePayments: true,
        latePayments: true,
        onTimePaymentRate: true,
        avgDaysToPayment: true,
        reliabilityScore: true,
        lastMetricsUpdate: true,
      },
    });

    if (!buyer) throw new Error('Buyer not found');

    return {
      buyerId: buyer.id,
      companyName: buyer.companyName,
      totalInvoicesPaid: buyer.totalInvoicesPaid,
      onTimePayments: buyer.onTimePayments,
      latePayments: buyer.latePayments,
      onTimePaymentRate: buyer.onTimePaymentRate,
      avgDaysToPayment: buyer.avgDaysToPayment,
      reliabilityScore: buyer.reliabilityScore,
      lastMetricsUpdate: buyer.lastMetricsUpdate,
    };
  }

  /**
   * Refresh all metrics (for cron job or admin trigger)
   */
  async refreshAllMetrics() {
    const [sellers, buyers] = await Promise.all([
      prisma.seller.findMany({ select: { id: true } }),
      prisma.buyer.findMany({ select: { id: true } }),
    ]);

    const results = {
      sellers: { updated: 0, failed: 0 },
      buyers: { updated: 0, failed: 0 },
    };

    // Update all seller metrics
    for (const seller of sellers) {
      try {
        await this.calculateSellerMetrics(seller.id);
        results.sellers.updated++;
      } catch (err) {
        console.error(`Failed to update seller ${seller.id} metrics:`, err);
        results.sellers.failed++;
      }
    }

    // Update all buyer metrics
    for (const buyer of buyers) {
      try {
        await this.calculateBuyerMetrics(buyer.id);
        results.buyers.updated++;
      } catch (err) {
        console.error(`Failed to update buyer ${buyer.id} metrics:`, err);
        results.buyers.failed++;
      }
    }

    return results;
  }

  /**
   * Update metrics after a payment event
   * Called when a repayment is marked as paid
   */
  async updateMetricsOnPayment(repaymentId: string) {
    const repayment = await prisma.repayment.findUnique({
      where: { id: repaymentId },
      include: {
        disbursement: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!repayment?.disbursement?.invoice) return;

    const invoice = repayment.disbursement.invoice;

    // Update seller metrics
    if (invoice.sellerId) {
      await this.calculateSellerMetrics(invoice.sellerId);
    }

    // Update buyer metrics if buyer was the payer
    if (repayment.payerType === 'BUYER' && invoice.buyerId) {
      await this.calculateBuyerMetrics(invoice.buyerId);
    }
  }

  /**
   * Get top performing sellers
   */
  async getTopPerformingSellers(limit: number = 10) {
    const sellers = await prisma.seller.findMany({
      where: {
        performanceScore: { not: null },
        totalInvoicesSettled: { gte: 1 },
      },
      orderBy: { performanceScore: 'desc' },
      take: limit,
      select: {
        id: true,
        companyName: true,
        totalInvoicesSettled: true,
        onTimePayments: true,
        performanceScore: true,
      },
    });

    return sellers.map((s) => ({
      ...s,
      onTimeRate:
        s.totalInvoicesSettled > 0
          ? Math.round(((s.onTimePayments || 0) / s.totalInvoicesSettled) * 1000) / 10
          : null,
    }));
  }

  /**
   * Get top reliable buyers
   */
  async getTopReliableBuyers(limit: number = 10) {
    const buyers = await prisma.buyer.findMany({
      where: {
        reliabilityScore: { not: null },
        totalInvoicesPaid: { gte: 1 },
      },
      orderBy: { reliabilityScore: 'desc' },
      take: limit,
      select: {
        id: true,
        companyName: true,
        totalInvoicesPaid: true,
        onTimePayments: true,
        onTimePaymentRate: true,
        reliabilityScore: true,
      },
    });

    return buyers;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private groupByTimePeriod<T extends Record<string, any>>(
    items: T[],
    groupBy: string,
    dateField: keyof T
  ): { date: string; items: T[] }[] {
    const groups: Map<string, T[]> = new Map();

    items.forEach((item) => {
      const date = new Date(item[dateField] as Date);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, items]) => ({ date, items }));
  }
}

export const analyticsService = new AnalyticsService();
