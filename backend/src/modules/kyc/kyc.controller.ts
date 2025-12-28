import { Request, Response } from 'express';
import { kycService } from './kyc.service';
import { sendSuccess, sendCreated, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import { KycDocumentType } from '@prisma/client';

// Upload KYC document
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  const { documentType } = req.body;

  const document = await kycService.uploadDocument(
    req.user.userId,
    req.user.userType,
    documentType as KycDocumentType,
    req.file
  );

  return sendCreated(res, document, 'Document uploaded successfully');
});

// Get user's documents
export const getMyDocuments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const documents = await kycService.getUserDocuments(req.user.userId, req.user.userType);
  return sendSuccess(res, documents);
});

// Get single document
export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { documentId } = req.params;

  // Admin can access any document, others only their own
  const document = req.user.userType === 'ADMIN'
    ? await kycService.getDocument(documentId)
    : await kycService.getDocument(documentId, req.user.userId, req.user.userType);

  return sendSuccess(res, document);
});

// Delete document (for re-upload)
export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { documentId } = req.params;
  await kycService.deleteDocument(documentId, req.user.userId, req.user.userType);

  return sendSuccess(res, null, 'Document deleted successfully');
});

// Get KYC status
export const getKycStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const status = await kycService.getKycStatus(req.user.userId, req.user.userType);
  return sendSuccess(res, status);
});

// Admin: Get pending documents
export const getPendingDocuments = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    status: req.query.status as any,
    entityType: req.query.entityType as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await kycService.getPendingDocuments(query);
  return sendPaginated(res, result.documents, result.pagination);
});

// Admin: Review document
export const reviewDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { documentId } = req.params;
  const { status, rejectionReason } = req.body;

  const document = await kycService.reviewDocument(documentId, req.user.userId, {
    status,
    rejectionReason,
  });

  const message = status === 'APPROVED' ? 'Document approved' : 'Document rejected';
  return sendSuccess(res, document, message);
});
