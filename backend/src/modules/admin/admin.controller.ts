import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

// Get dashboard statistics
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  return sendSuccess(res, stats);
});

// List all users
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    userType: req.query.userType as any,
    status: req.query.status as any,
    search: req.query.search as string,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await adminService.listUsers(query);
  return sendPaginated(res, result.users, result.pagination);
});

// Get user details
export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await adminService.getUserDetails(userId);
  return sendSuccess(res, user);
});

// Update user status
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { userId } = req.params;
  const user = await adminService.updateUserStatus(userId, req.body, req.user.userId);
  return sendSuccess(res, user, 'User status updated');
});

// List all invoices
export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    status: req.query.status as any,
    productType: req.query.productType as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await adminService.listInvoices(query);
  return sendPaginated(res, result.invoices, result.pagination);
});

// List transactions
export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await adminService.listTransactions(query);
  return sendPaginated(res, result.transactions, result.pagination);
});

// List audit logs
export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    userId: req.query.userId as string,
    action: req.query.action as string,
    entityType: req.query.entityType as string,
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 50,
  };

  const result = await adminService.listAuditLogs(query);
  return sendPaginated(res, result.logs, result.pagination);
});
