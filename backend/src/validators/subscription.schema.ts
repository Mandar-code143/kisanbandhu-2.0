import { z } from "zod";

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    price: z.number().positive(),
    durationDays: z.number().int().positive(),
    features: z.record(z.any()),
    ivrCallsLimit: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    price: z.number().positive().optional(),
    durationDays: z.number().int().positive().optional(),
    features: z.record(z.any()).optional(),
    ivrCallsLimit: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid(),
    autoRenew: z.boolean().default(false),
  }),
});

export const upgradeSubscriptionSchema = z.object({
  body: z.object({
    newPlanId: z.string().uuid(),
  }),
});

export const subscriptionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
  }),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>["body"];
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>["body"];
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>["body"];
export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>["body"];
