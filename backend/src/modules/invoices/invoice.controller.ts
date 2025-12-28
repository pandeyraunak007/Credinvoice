import { Request, Response } from 'express';
import { invoiceService } from './invoice.service';
import { sendSuccess, sendCreated, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import { getExtractedValues } from './invoice.extractor';

// Extract invoice from uploaded file
export const extractInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  const result = await invoiceService.extractInvoice(
    req.user.userId,
    req.user.userType,
    req.file
  );

  return sendSuccess(res, result, 'Invoice data extracted successfully');
});

// Create invoice
export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const documentUrl = req.file ? `/uploads/invoices/${req.file.filename}` : undefined;

  const invoice = await invoiceService.createInvoice(
    req.user.userId,
    req.user.userType,
    req.body,
    documentUrl
  );

  return sendCreated(res, invoice, 'Invoice created successfully');
});

// Get invoice by ID
export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  const invoice = await invoiceService.getInvoice(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, invoice);
});

// List invoices
export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    status: req.query.status as any,
    productType: req.query.productType as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await invoiceService.listInvoices(
    req.user.userId,
    req.user.userType,
    query
  );

  return sendPaginated(res, result.invoices, result.pagination);
});

// Update invoice
export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  const invoice = await invoiceService.updateInvoice(
    invoiceId,
    req.user.userId,
    req.user.userType,
    req.body
  );

  return sendSuccess(res, invoice, 'Invoice updated successfully');
});

// Delete invoice
export const deleteInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  await invoiceService.deleteInvoice(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, null, 'Invoice deleted successfully');
});

// Submit invoice
export const submitInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  const invoice = await invoiceService.submitInvoice(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, invoice, 'Invoice submitted successfully');
});

// Accept invoice
export const acceptInvoice = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  const invoice = await invoiceService.acceptInvoice(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, invoice, 'Invoice accepted successfully');
});

// Open invoice for bidding
export const openForBidding = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { invoiceId } = req.params;
  const invoice = await invoiceService.openForBidding(
    invoiceId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, invoice, 'Invoice opened for bidding');
});

// Get available invoices for bidding (financiers)
export const getAvailableForBidding = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await invoiceService.getAvailableForBidding(req.user.userId, query);

  return sendPaginated(res, result.invoices, result.pagination);
});
