import { Router } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateUserStatusSchema } from './admin.validation';
import {
  getDashboardStats,
  listUsers,
  getUserDetails,
  updateUserStatus,
  listInvoices,
  listTransactions,
  listAuditLogs,
} from './admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

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
