import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';

// Get user's notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const query = {
    unreadOnly: req.query.unreadOnly === 'true',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await notificationService.getUserNotifications(req.user.userId, query);

  return res.json({
    success: true,
    data: result.notifications,
    unreadCount: result.unreadCount,
    pagination: result.pagination,
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { notificationId } = req.params;
  const notification = await notificationService.markAsRead(notificationId, req.user.userId);

  return sendSuccess(res, notification, 'Notification marked as read');
});

// Mark all as read
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const result = await notificationService.markAllAsRead(req.user.userId);

  return sendSuccess(res, result, `Marked ${result.markedCount} notifications as read`);
});

// Delete notification
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const { notificationId } = req.params;
  await notificationService.deleteNotification(notificationId, req.user.userId);

  return sendSuccess(res, null, 'Notification deleted');
});
