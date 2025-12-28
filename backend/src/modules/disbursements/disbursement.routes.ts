import { Router } from 'express';
import { authenticate, buyerOnly, financierOnly, adminOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import {
  initiateDisbursementSchema,
  initiateFinancierDisbursementSchema,
  updateDisbursementStatusSchema,
  markRepaymentPaidSchema,
} from './disbursement.validation';
import {
  initiateSelfFundedDisbursement,
  initiateFinancierDisbursement,
  updateDisbursementStatus,
  getDisbursement,
  listDisbursements,
  getUpcomingRepayments,
  markRepaymentPaid,
  updateOverdueRepayments,
} from './disbursement.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Disbursement routes
router.post(
  '/self-funded',
  buyerOnly,
  validateBody(initiateDisbursementSchema),
  initiateSelfFundedDisbursement
);

router.post(
  '/financier',
  financierOnly,
  validateBody(initiateFinancierDisbursementSchema),
  initiateFinancierDisbursement
);

router.get('/', listDisbursements);
router.get('/:disbursementId', getDisbursement);

router.patch(
  '/:disbursementId/status',
  validateBody(updateDisbursementStatusSchema),
  updateDisbursementStatus
);

// Repayment routes
router.get('/repayments/upcoming', getUpcomingRepayments);

router.post(
  '/repayments/:repaymentId/mark-paid',
  validateBody(markRepaymentPaidSchema),
  markRepaymentPaid
);

// Admin: Update overdue repayments (can also be triggered by cron)
router.post('/repayments/update-overdue', adminOnly, updateOverdueRepayments);

export default router;
