import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getContracts,
  getContractById,
  getContractText,
  downloadContract,
} from './contract.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all contracts for the authenticated user
router.get('/', getContracts);

// Get a single contract by ID
router.get('/:contractId', getContractById);

// Get contract text (for display)
router.get('/:contractId/text', getContractText);

// Download contract as file
router.get('/:contractId/download', downloadContract);

export default router;
