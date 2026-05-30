import { Request, Response, NextFunction } from "express";
import { subscriptionsService } from "./subscriptions.service";
import { AuthenticatedRequest } from "../../types";

export class SubscriptionsController {
  async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await subscriptionsService.createPlan(req.body);
      res.status(201).json({ success: true, message: "Plan created", data: plan });
    } catch (error) {
      next(error);
    }
  }

  async listPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const plans = await subscriptionsService.listPlans(includeInactive);
      res.status(200).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  async getPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await subscriptionsService.getPlan(req.params.id);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await subscriptionsService.updatePlan(req.params.id, req.body);
      res.status(200).json({ success: true, message: "Plan updated", data: plan });
    } catch (error) {
      next(error);
    }
  }

  async deletePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await subscriptionsService.deletePlan(req.params.id);
      res.status(200).json({ success: true, message: "Plan deleted" });
    } catch (error) {
      next(error);
    }
  }

  async createSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionsService.createSubscription(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: "Subscription created", data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async getMySubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionsService.getUserSubscription(req.user!.userId);
      res.status(200).json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async getMySubscriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscriptions = await subscriptionsService.getUserSubscriptions(req.user!.userId);
      res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
      next(error);
    }
  }

  async listSubscriptions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "20", status } = req.query;
      const result = await subscriptionsService.listSubscriptions({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as string | undefined,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionsService.cancelSubscription(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: "Subscription cancelled", data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async upgradeSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionsService.upgradeSubscription(req.user!.userId, req.body.newPlanId);
      res.status(200).json({ success: true, message: "Subscription upgraded", data: subscription });
    } catch (error) {
      next(error);
    }
  }

  async checkSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const active = await subscriptionsService.checkActiveSubscription(req.user!.userId);
      res.status(200).json({ success: true, data: { active } });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
