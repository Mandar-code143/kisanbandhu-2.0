import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth";

const router = Router();

router.get("/dashboard", authenticate, requireAdmin, (req, res, next) =>
  analyticsController.getDashboardStats(req as any, res, next)
);

router.get("/revenue", authenticate, requireAdmin, (req, res, next) =>
  analyticsController.getRevenueAnalytics(req as any, res, next)
);

router.get("/users", authenticate, requireAdmin, (req, res, next) =>
  analyticsController.getUserAnalytics(req as any, res, next)
);

router.get("/jobs", authenticate, requireAdmin, (req, res, next) =>
  analyticsController.getJobAnalytics(req as any, res, next)
);

router.get("/subscriptions", authenticate, requireAdmin, (req, res, next) =>
  analyticsController.getSubscriptionAnalytics(req as any, res, next)
);

router.get("/ivr", authenticate, requireAdmin, (req, res, next) =>
  analyticsController.getIvrAnalytics(req as any, res, next)
);

export default router;
