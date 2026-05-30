import { Response, NextFunction } from "express";
import { notificationsService } from "./notifications.service";
import { AuthenticatedRequest } from "../../types";

export class NotificationsController {
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", unreadOnly } = req.query;

      const result = await notificationsService.getUserNotifications(req.user!.userId, {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        unreadOnly: unreadOnly === "true",
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationsService.markAsRead(req.params.id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.markAllAsRead(req.user!.userId);

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await notificationsService.deleteNotification(req.params.id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error) {
      next(error);
    }
  }

  async broadcast(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.broadcastNotification(req.body);

      res.status(200).json({
        success: true,
        message: "Broadcast sent",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationsService.getUnreadCount(req.user!.userId);

      res.status(200).json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
