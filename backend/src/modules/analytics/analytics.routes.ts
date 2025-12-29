import { Router } from 'express';
import { authenticate, buyerOnly, sellerOnly, financierOnly, adminOnly } from '../../middleware/auth';
import {
  // Buyer
  getBuyerSummary,
  getBuyerInvoiceTrends,
  getBuyerDiscountSavings,
  getBuyerSellerPerformance,
  getBuyerFundingBreakdown,
  // Seller
  getSellerSummary,
  getSellerRevenueTrends,
  getSellerDiscountAnalysis,
  getSellerBuyerMetrics,
  // Financier
  getFinancierSummary,
  getFinancierPortfolioTrends,
  getFinancierYieldAnalysis,
  getFinancierSectorBreakdown,
  // Admin
  getAdminPlatformSummary,
  getAdminUserGrowth,
  getAdminKycFunnel,
  getAdminInvoiceDistribution,
} from './analytics.controller';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// ============================================
// BUYER ANALYTICS - /api/v1/analytics/buyer/*
// ============================================
router.get('/buyer/summary', buyerOnly, getBuyerSummary);
router.get('/buyer/invoice-trends', buyerOnly, getBuyerInvoiceTrends);
router.get('/buyer/discount-savings', buyerOnly, getBuyerDiscountSavings);
router.get('/buyer/seller-performance', buyerOnly, getBuyerSellerPerformance);
router.get('/buyer/funding-breakdown', buyerOnly, getBuyerFundingBreakdown);

// ============================================
// SELLER ANALYTICS - /api/v1/analytics/seller/*
// ============================================
router.get('/seller/summary', sellerOnly, getSellerSummary);
router.get('/seller/revenue-trends', sellerOnly, getSellerRevenueTrends);
router.get('/seller/discount-analysis', sellerOnly, getSellerDiscountAnalysis);
router.get('/seller/buyer-metrics', sellerOnly, getSellerBuyerMetrics);

// ============================================
// FINANCIER ANALYTICS - /api/v1/analytics/financier/*
// ============================================
router.get('/financier/summary', financierOnly, getFinancierSummary);
router.get('/financier/portfolio-trends', financierOnly, getFinancierPortfolioTrends);
router.get('/financier/yield-analysis', financierOnly, getFinancierYieldAnalysis);
router.get('/financier/sector-breakdown', financierOnly, getFinancierSectorBreakdown);

// ============================================
// ADMIN ANALYTICS - /api/v1/analytics/admin/*
// ============================================
router.get('/admin/platform-summary', adminOnly, getAdminPlatformSummary);
router.get('/admin/user-growth', adminOnly, getAdminUserGrowth);
router.get('/admin/kyc-funnel', adminOnly, getAdminKycFunnel);
router.get('/admin/invoice-distribution', adminOnly, getAdminInvoiceDistribution);

export default router;
