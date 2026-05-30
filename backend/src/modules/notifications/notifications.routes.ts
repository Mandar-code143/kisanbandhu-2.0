import { Router } from "express";
import { notificationsController } from "./notifications.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, (req, res, next) =>
  notificationsController.getNotifications(req as any, res, next)
);

router.get("/unread-count", authenticate, (req, res, next) =>
  notificationsController.getUnreadCount(req as any, res, next)
);

router.put("/:id/read", authenticate, (req, res, next) =>
  notificationsController.markAsRead(req as any, res, next)
);

router.put("/read-all", authenticate, (req, res, next) =>
  notificationsController.markAllAsRead(req as any, res, next)
);

router.delete("/:id", authenticate, (req, res, next) =>
  notificationsController.deleteNotification(req as any, res, next)
);

router.post("/broadcast", authenticate, requireAdmin, (req, res, next) =>
  notificationsController.broadcast(req as any, res, next)
);

export default router;
