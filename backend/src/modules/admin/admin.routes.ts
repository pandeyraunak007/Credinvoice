import { Router } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateUserStatusSchema, reviewKycSchema } from './admin.validation';
import {
  getDashboardStats,
  listUsers,
  getUserDetails,
  updateUserStatus,
  listInvoices,
  listTransactions,
  listAuditLogs,
  listKycApplications,
  getKycApplicationDetails,
  approveKyc,
  rejectKyc,
} from './admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// KYC Applications
router.get('/kyc-applications', listKycApplications);
router.get('/kyc-applications/:userId', getKycApplicationDetails);
router.post('/kyc-applications/:userId/approve', approveKyc);
router.post('/kyc-applications/:userId/reject', validateBody(reviewKycSchema), rejectKyc);

// Users
router.get('/users', listUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/status', validateBody(updateUserStatusSchema), updateUserStatus);

// Invoices
router.get('/invoices', listInvoices);

// Transactions
router.get('/transactions', listTransactions);

// Audit logs
router.get('/audit-logs', listAuditLogs);

export default router;
