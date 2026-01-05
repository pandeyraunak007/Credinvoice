import { Request, Response } from 'express';
import { vendorService } from './vendor.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import { listVendorsQuerySchema } from './vendor.validation';

// Get my vendors list
export const getMyVendors = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  // Parse query params with validation
  const queryResult = listVendorsQuerySchema.safeParse(req.query);
  const query = queryResult.success ? queryResult.data : {
    search: req.query.search as string | undefined,
    status: 'ACTIVE' as const,
    page: 1,
    limit: 20,
  };

  const result = await vendorService.getMyVendors(
    req.user.userId,
    req.user.userType,
    query
  );

  return sendSuccess(res, result);
});

// Get vendor detail with transaction history
export const getVendorDetail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { vendorId } = req.params;

  const result = await vendorService.getVendorDetail(
    req.user.userId,
    req.user.userType,
    vendorId
  );

  return sendSuccess(res, result);
});

// Add vendor manually
export const addVendor = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const mapping = await vendorService.addVendor(
    req.user.userId,
    req.user.userType,
    req.body
  );

  return sendCreated(res, mapping, 'Vendor added successfully');
});

// Remove vendor (soft delete)
export const removeVendor = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { vendorId } = req.params;

  const result = await vendorService.removeVendor(
    req.user.userId,
    req.user.userType,
    vendorId
  );

  return sendSuccess(res, result);
});

// Update vendor (status, notes)
export const updateVendor = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { vendorId } = req.params;

  const updated = await vendorService.updateVendor(
    req.user.userId,
    req.user.userType,
    vendorId,
    req.body
  );

  return sendSuccess(res, updated, 'Vendor updated successfully');
});

// Get available vendors to add
export const getAvailableVendors = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { search } = req.query;

  const vendors = await vendorService.getAvailableVendors(
    req.user.userId,
    req.user.userType,
    search as string | undefined
  );

  return sendSuccess(res, vendors);
});

// Refer a vendor (for non-existent vendors)
export const referVendor = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const referral = await vendorService.referVendor(
    req.user.userId,
    req.user.userType,
    req.body
  );

  return sendCreated(res, referral, 'Vendor referral created successfully');
});
