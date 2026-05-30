import { Router } from "express";
import { ivrController } from "./ivr.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { ivrLimiter } from "../../middlewares/rateLimiter";
import {
  createIvrRequestSchema,
  updateIvrRequestSchema,
  ivrQuerySchema,
  updateIvrSettingsSchema,
} from "../../validators/ivr.schema";

const router = Router();

// User endpoints
router.post("/request", authenticate, ivrLimiter, validate(createIvrRequestSchema), (req, res, next) =>
  ivrController.requestCall(req as any, res, next)
);

router.get("/my-requests", authenticate, (req, res, next) =>
  ivrController.getMyRequests(req as any, res, next)
);

// Admin endpoints
router.get("/admin/requests", authenticate, requireAdmin, validate(ivrQuerySchema), (req, res, next) =>
  ivrController.getPendingRequests(req as any, res, next)
);

router.put("/admin/requests/:id", authenticate, requireAdmin, validate(updateIvrRequestSchema), (req, res, next) =>
  ivrController.updateRequestStatus(req as any, res, next)
);

router.post("/admin/requests/:id/trigger", authenticate, requireAdmin, (req, res, next) =>
  ivrController.triggerManualCall(req as any, res, next)
);

router.get("/admin/settings", authenticate, requireAdmin, (req, res, next) =>
  ivrController.getSettings(req as any, res, next)
);

router.put("/admin/settings", authenticate, requireAdmin, validate(updateIvrSettingsSchema), (req, res, next) =>
  ivrController.updateSettings(req as any, res, next)
);

export default router;
