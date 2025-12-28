import { Request, Response } from 'express';
import { discountService } from './discount.service';
import { sendSuccess, sendCreated, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

// Create discount offer (Buyer)
export const createDiscountOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const offer = await discountService.createDiscountOffer(req.user.userId, req.body);
  return sendCreated(res, offer, 'Discount offer created successfully');
});

// Get discount offer by ID
export const getDiscountOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { offerId } = req.params;
  const offer = await discountService.getDiscountOffer(
    offerId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, offer);
});

// Get pending offers for seller
export const getSellerPendingOffers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await discountService.getSellerPendingOffers(req.user.userId, query);
  return sendPaginated(res, result.offers, result.pagination);
});

// Get buyer's offers
export const getBuyerOffers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await discountService.getBuyerOffers(req.user.userId, query);
  return sendPaginated(res, result.offers, result.pagination);
});

// Update discount offer (Buyer, before seller responds)
export const updateDiscountOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { offerId } = req.params;
  const offer = await discountService.updateDiscountOffer(
    offerId,
    req.user.userId,
    req.body
  );

  return sendSuccess(res, offer, 'Discount offer updated successfully');
});

// Seller responds to offer (accept/reject)
export const respondToOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { offerId } = req.params;
  const offer = await discountService.respondToOffer(
    offerId,
    req.user.userId,
    req.body
  );

  const message = req.body.action === 'ACCEPT'
    ? 'Discount offer accepted'
    : 'Discount offer rejected';

  return sendSuccess(res, offer, message);
});

// Cancel discount offer (Buyer)
export const cancelOffer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { offerId } = req.params;
  const offer = await discountService.cancelOffer(offerId, req.user.userId);

  return sendSuccess(res, offer, 'Discount offer cancelled');
});

// Authorize self-funded payment (Buyer)
export const authorizePayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { offerId } = req.params;
  const { bankAccountId } = req.body;

  const disbursement = await discountService.authorizePayment(
    offerId,
    req.user.userId,
    bankAccountId
  );

  return sendSuccess(res, disbursement, 'Payment authorized successfully');
});
