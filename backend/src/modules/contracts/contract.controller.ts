import { Request, Response } from 'express';
import { contractService } from './contract.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

/**
 * Get all contracts for the authenticated user
 */
export const getContracts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    contractType: req.query.contractType as any,
    status: req.query.status as any,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await contractService.getContractsForUser(
    req.user.userId,
    req.user.userType,
    query
  );

  return sendPaginated(res, result.contracts, result.pagination);
});

/**
 * Get a single contract by ID
 */
export const getContractById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  return sendSuccess(res, contract);
});

/**
 * Get contract text (for display/download)
 */
export const getContractText = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  // Return just the contract text
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(contract.contractText);
});

/**
 * Download contract as text file
 */
export const downloadContract = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { contractId } = req.params;

  const contract = await contractService.getContractById(
    contractId,
    req.user.userId,
    req.user.userType
  );

  const filename = `${contract.contractNumber}.txt`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(contract.contractText);
});
