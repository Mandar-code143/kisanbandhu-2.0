import prisma from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { CreatePlanInput, UpdatePlanInput, CreateSubscriptionInput } from "../../validators/subscription.schema";
import logger from "../../utils/logger";

export class SubscriptionsService {
  async createPlan(input: CreatePlanInput) {
    const existing = await prisma.plan.findUnique({ where: { name: input.name } });
    if (existing) {
      throw ApiError.conflict("A plan with this name already exists");
    }

    const plan = await prisma.plan.create({ data: input });
    logger.info(`Plan created: ${plan.name} (${plan.id})`);
    return plan;
  }

  async listPlans(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };

    const plans = await prisma.plan.findMany({
      where,
      include: {
        _count: { select: { subscriptions: true } },
      },
      orderBy: { price: "asc" },
    });

    return plans;
  }

  async getPlan(planId: string) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    if (!plan) {
      throw ApiError.notFound("Plan not found");
    }

    return plan;
  }

  async updatePlan(planId: string, input: UpdatePlanInput) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw ApiError.notFound("Plan not found");
    }

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: input,
    });

    logger.info(`Plan updated: ${planId}`);
    return updated;
  }

  async deletePlan(planId: string) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw ApiError.notFound("Plan not found");
    }

    const activeSubs = await prisma.subscription.count({
      where: { planId, status: "ACTIVE" },
    });

    if (activeSubs > 0) {
      await prisma.plan.update({
        where: { id: planId },
        data: { isActive: false },
      });
      logger.info(`Plan deactivated (has active subs): ${planId}`);
      return;
    }

    await prisma.plan.delete({ where: { id: planId } });
    logger.info(`Plan deleted: ${planId}`);
  }

  async createSubscription(userId: string, input: CreateSubscriptionInput) {
    const plan = await prisma.plan.findUnique({ where: { id: input.planId } });
    if (!plan || !plan.isActive) {
      throw ApiError.notFound("Plan not found or inactive");
    }

    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (activeSub) {
      throw ApiError.conflict("You already have an active subscription");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: input.planId,
        startDate,
        endDate,
        autoRenew: input.autoRenew ?? false,
      },
      include: { plan: true },
    });

    logger.info(`Subscription created: ${subscription.id} for user ${userId}`);
    return subscription;
  }

  async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    return subscription;
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: { plan: true, invoices: true },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions;
  }

  async listSubscriptions(params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          plan: { select: { id: true, name: true, price: true } },
          user: {
            select: {
              id: true,
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          invoices: { select: { id: true, amount: true, status: true, createdAt: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.count({ where }),
    ]);

    return {
      data: subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });

    if (!sub) {
      throw ApiError.notFound("Subscription not found");
    }

    if (sub.userId !== userId) {
      throw ApiError.forbidden("You can only cancel your own subscription");
    }

    if (sub.status !== "ACTIVE") {
      throw ApiError.badRequest("Subscription is not active");
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED" },
      include: { plan: true },
    });

    logger.info(`Subscription cancelled: ${subscriptionId}`);
    return updated;
  }

  async upgradeSubscription(userId: string, newPlanId: string) {
    const newPlan = await prisma.plan.findUnique({ where: { id: newPlanId } });
    if (!newPlan || !newPlan.isActive) {
      throw ApiError.notFound("New plan not found or inactive");
    }

    const currentSub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { plan: true },
    });

    if (!currentSub) {
      throw ApiError.badRequest("No active subscription to upgrade");
    }

    if (newPlan.price <= currentSub.plan.price) {
      throw ApiError.badRequest("New plan must have higher price than current plan");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + newPlan.durationDays);

    const [updated] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id: currentSub.id },
        data: { status: "CANCELLED" },
      }),
      prisma.subscription.create({
        data: {
          userId,
          planId: newPlanId,
          startDate,
          endDate,
          autoRenew: currentSub.autoRenew,
        },
        include: { plan: true },
      }),
    ]);

    const newSub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    logger.info(`Subscription upgraded: ${currentSub.id} -> ${newPlanId}`);
    return newSub;
  }

  async checkActiveSubscription(userId: string): Promise<boolean> {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        endDate: { gt: new Date() },
      },
    });

    return !!sub;
  }

  async expireSubscriptions() {
    const expired = await prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    if (expired.count > 0) {
      logger.info(`Expired ${expired.count} subscriptions`);
    }

    return expired.count;
  }
}

export const subscriptionsService = new SubscriptionsService();
