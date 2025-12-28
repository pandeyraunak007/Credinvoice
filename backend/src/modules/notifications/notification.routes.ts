import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from './notification.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', getNotifications);

// Mark all as read
router.post('/mark-all-read', markAllAsRead);

// Mark single as read
router.post('/:notificationId/read', markAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;
