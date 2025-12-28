import { Request, Response } from 'express';
import { bidService } from './bid.service';
import { sendSuccess, sendCreated, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

// Create bid (Financier)
export const createBid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const bid = await bidService.createBid(req.user.userId, req.body);
  return sendCreated(res, bid, 'Bid placed successfully');
});

// Get bid by ID
export const getBid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { bidId } = req.params;
  const bid = await bidService.getBid(bidId, req.user.userId, req.user.userType);

  return sendSuccess(res, bid);
});

// Get bids for an invoice
export const getInvoiceBids = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  const bids = await bidService.getInvoiceBids(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, bids);
});

// Get financier's bids
export const getMyBids = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await bidService.getFinancierBids(req.user.userId, query);
  return sendPaginated(res, result.bids, result.pagination);
});

// Update bid (Financier)
export const updateBid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { bidId } = req.params;
  const bid = await bidService.updateBid(bidId, req.user.userId, req.body);

  return sendSuccess(res, bid, 'Bid updated successfully');
});

// Withdraw bid (Financier)
export const withdrawBid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { bidId } = req.params;
  const bid = await bidService.withdrawBid(bidId, req.user.userId);

  return sendSuccess(res, bid, 'Bid withdrawn');
});

// Accept bid (Buyer/Seller)
export const acceptBid = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { bidId } = req.params;
  const bid = await bidService.acceptBid(bidId, req.user.userId, req.user.userType);

  return sendSuccess(res, bid, 'Bid accepted successfully');
});
