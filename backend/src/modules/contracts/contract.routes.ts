import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getContracts,
  getContractById,
  getContractText,
  downloadContract,
  getContractByInvoiceId,
  downloadContractPDF,
} from './contract.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all contracts for the authenticated user
router.get('/', getContracts);

// Get contract by invoice ID
router.get('/invoice/:invoiceId', getContractByInvoiceId);

// Get a single contract by ID
router.get('/:contractId', getContractById);

// Get contract text (for display)
router.get('/:contractId/text', getContractText);

// Download contract as text file
router.get('/:contractId/download', downloadContract);

// Download contract as PDF
router.get('/:contractId/pdf', downloadContractPDF);

export default router;
