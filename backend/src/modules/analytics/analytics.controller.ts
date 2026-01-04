import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';

// ============================================
// BUYER ANALYTICS
// ============================================

export const getBuyerSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getBuyerSummary(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBuyerInvoiceTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';
    const groupBy = (req.query.groupBy as string) || 'week';

    const data = await analyticsService.getBuyerInvoiceTrends(userId, period, groupBy);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBuyerDiscountSavings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getBuyerDiscountSavings(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBuyerSellerPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await analyticsService.getBuyerSellerPerformance(userId, period, limit);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getBuyerFundingBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getBuyerFundingBreakdown(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ============================================
// SELLER ANALYTICS
// ============================================

export const getSellerSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getSellerSummary(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSellerRevenueTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';
    const groupBy = (req.query.groupBy as string) || 'week';

    const data = await analyticsService.getSellerRevenueTrends(userId, period, groupBy);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSellerDiscountAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getSellerDiscountAnalysis(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSellerBuyerMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await analyticsService.getSellerBuyerMetrics(userId, period, limit);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ============================================
// FINANCIER ANALYTICS
// ============================================

export const getFinancierSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getFinancierSummary(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getFinancierPortfolioTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';
    const groupBy = (req.query.groupBy as string) || 'week';

    const data = await analyticsService.getFinancierPortfolioTrends(userId, period, groupBy);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getFinancierYieldAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getFinancierYieldAnalysis(userId, period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getFinancierSectorBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const data = await analyticsService.getFinancierSectorBreakdown(userId);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ADMIN ANALYTICS
// ============================================

export const getAdminPlatformSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getAdminPlatformSummary(period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserGrowth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || 'month';
    const groupBy = (req.query.groupBy as string) || 'week';

    const data = await analyticsService.getAdminUserGrowth(period, groupBy);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminKycFunnel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getAdminKycFunnel(period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdminInvoiceDistribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || 'month';

    const data = await analyticsService.getAdminInvoiceDistribution(period);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// ============================================
// PERFORMANCE METRICS
// ============================================

/**
 * Get seller performance metrics
 */
export const getSellerPerformanceMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.params.sellerId;
    const data = await analyticsService.getSellerMetrics(sellerId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get buyer reliability metrics
 */
export const getBuyerReliabilityMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = req.params.buyerId;
    const data = await analyticsService.getBuyerMetrics(buyerId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh all metrics (admin only)
 */
export const refreshAllMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.refreshAllMetrics();
    res.json({ success: true, data, message: 'Metrics refresh completed' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top performing sellers
 */
export const getTopPerformingSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await analyticsService.getTopPerformingSellers(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top reliable buyers
 */
export const getTopReliableBuyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await analyticsService.getTopReliableBuyers(limit);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
