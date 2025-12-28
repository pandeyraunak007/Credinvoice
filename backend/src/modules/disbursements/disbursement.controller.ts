import { Request, Response } from 'express';
import { disbursementService } from './disbursement.service';
import { sendSuccess, sendCreated, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

// Initiate self-funded disbursement (Buyer - Dynamic Discounting)
export const initiateSelfFundedDisbursement = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const disbursement = await disbursementService.initiateSelfFundedDisbursement(
    req.user.userId,
    req.body
  );
  return sendCreated(res, disbursement, 'Disbursement initiated successfully');
});

// Initiate financier-funded disbursement (Financier)
export const initiateFinancierDisbursement = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const result = await disbursementService.initiateFinancierDisbursement(
    req.user.userId,
    req.body
  );
  return sendCreated(res, result, 'Disbursement initiated, repayment scheduled');
});

// Update disbursement status
export const updateDisbursementStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { disbursementId } = req.params;
  const disbursement = await disbursementService.updateDisbursementStatus(
    disbursementId,
    req.user.userId,
    req.user.userType,
    req.body
  );

  return sendSuccess(res, disbursement, 'Disbursement status updated');
});

// Get disbursement by ID
export const getDisbursement = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { disbursementId } = req.params;
  const disbursement = await disbursementService.getDisbursement(
    disbursementId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, disbursement);
});

// List disbursements
export const listDisbursements = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await disbursementService.listDisbursements(
    req.user.userId,
    req.user.userType,
    query
  );
  return sendPaginated(res, result.disbursements, result.pagination);
});

// Get upcoming repayments
export const getUpcomingRepayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    status: req.query.status as any,
    upcoming: req.query.upcoming === 'true',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await disbursementService.getUpcomingRepayments(
    req.user.userId,
    req.user.userType,
    query
  );
  return sendPaginated(res, result.repayments, result.pagination);
});

// Mark repayment as paid
export const markRepaymentPaid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { repaymentId } = req.params;
  const repayment = await disbursementService.markRepaymentPaid(
    repaymentId,
    req.user.userId,
    req.user.userType,
    req.body
  );

  return sendSuccess(res, repayment, 'Repayment marked as paid');
});

// Update overdue repayments (Admin only, or can be called by cron)
export const updateOverdueRepayments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const result = await disbursementService.updateOverdueRepayments();
  return sendSuccess(res, result, `Updated ${result.updatedCount} overdue repayments`);
});
