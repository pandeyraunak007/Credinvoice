import { Request, Response } from 'express';
import { profileService } from './profile.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

// Get current user's profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const profile = await profileService.getProfile(req.user.userId, req.user.userType);
  return sendSuccess(res, profile);
});

// Update profile (handles all user types)
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  let updated;

  switch (req.user.userType) {
    case 'BUYER':
      updated = await profileService.updateBuyerProfile(req.user.userId, req.body);
      break;
    case 'SELLER':
      updated = await profileService.updateSellerProfile(req.user.userId, req.body);
      break;
    case 'FINANCIER':
      updated = await profileService.updateFinancierProfile(req.user.userId, req.body);
      break;
    default:
      return sendError(res, 'Invalid user type', 400);
  }

  return sendSuccess(res, updated, 'Profile updated successfully');
});

// Get bank accounts
export const getBankAccounts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const accounts = await profileService.getBankAccounts(req.user.userId, req.user.userType);
  return sendSuccess(res, accounts);
});

// Add bank account
export const addBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const account = await profileService.addBankAccount(
    req.user.userId,
    req.user.userType,
    req.body
  );

  return sendCreated(res, account, 'Bank account added successfully');
});

// Update bank account
export const updateBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { accountId } = req.params;
  const updated = await profileService.updateBankAccount(
    req.user.userId,
    req.user.userType,
    accountId,
    req.body
  );

  return sendSuccess(res, updated, 'Bank account updated successfully');
});

// Delete bank account
export const deleteBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { accountId } = req.params;
  await profileService.deleteBankAccount(req.user.userId, req.user.userType, accountId);

  return sendSuccess(res, null, 'Bank account deleted successfully');
});

// Set primary bank account
export const setPrimaryBankAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { accountId } = req.params;
  const updated = await profileService.setPrimaryBankAccount(
    req.user.userId,
    req.user.userType,
    accountId
  );

  return sendSuccess(res, updated, 'Primary bank account updated');
});
