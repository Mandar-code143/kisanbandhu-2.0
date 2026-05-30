import { Router } from "express";
import { subscriptionsController } from "./subscriptions.controller";
import { authenticate, requireAdmin } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createPlanSchema,
  updatePlanSchema,
  createSubscriptionSchema,
  upgradeSubscriptionSchema,
} from "../../validators/subscription.schema";

const router = Router();

// Plans (admin only for create/update/delete)
router.get("/plans", (req, res, next) =>
  subscriptionsController.listPlans(req, res, next)
);

router.get("/plans/:id", (req, res, next) =>
  subscriptionsController.getPlan(req, res, next)
);

router.post("/plans", authenticate, requireAdmin, validate(createPlanSchema), (req, res, next) =>
  subscriptionsController.createPlan(req as any, res, next)
);

router.put("/plans/:id", authenticate, requireAdmin, validate(updatePlanSchema), (req, res, next) =>
  subscriptionsController.updatePlan(req as any, res, next)
);

router.delete("/plans/:id", authenticate, requireAdmin, (req, res, next) =>
  subscriptionsController.deletePlan(req as any, res, next)
);

// User subscriptions
router.post("/", authenticate, validate(createSubscriptionSchema), (req, res, next) =>
  subscriptionsController.createSubscription(req as any, res, next)
);

router.get("/mine", authenticate, (req, res, next) =>
  subscriptionsController.getMySubscription(req as any, res, next)
);

router.get("/mine/all", authenticate, (req, res, next) =>
  subscriptionsController.getMySubscriptions(req as any, res, next)
);

router.get("/check", authenticate, (req, res, next) =>
  subscriptionsController.checkSubscription(req as any, res, next)
);

router.put("/:id/cancel", authenticate, (req, res, next) =>
  subscriptionsController.cancelSubscription(req as any, res, next)
);

router.put("/upgrade", authenticate, validate(upgradeSubscriptionSchema), (req, res, next) =>
  subscriptionsController.upgradeSubscription(req as any, res, next)
);

// Admin view all subscriptions
router.get("/", authenticate, requireAdmin, (req, res, next) =>
  subscriptionsController.listSubscriptions(req as any, res, next)
);

export default router;
