import { z } from "zod";

export const createIvrRequestSchema = z.object({
  body: z.object({
    jobId: z.string().uuid().optional(),
    targetTaluka: z.string().optional(),
    targetNumber: z.string().regex(/^\+?[\d\s-]{10,15}$/).optional(),
    workerType: z.string().optional(),
    message: z.string().max(500).optional(),
  }),
});

export const updateIvrRequestSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    adminNotes: z.string().max(500).optional(),
  }),
});

export const ivrQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum(["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED"])
      .optional(),
  }),
});

export const updateIvrSettingsSchema = z.object({
  body: z.object({
    key: z.literal("ivr_global_enabled"),
    value: z.boolean(),
  }),
});

export type CreateIvrRequestInput = z.infer<typeof createIvrRequestSchema>["body"];
export type UpdateIvrRequestInput = z.infer<typeof updateIvrRequestSchema>["body"];
export type IvrQueryInput = z.infer<typeof ivrQuerySchema>["query"];
export type UpdateIvrSettingsInput = z.infer<typeof updateIvrSettingsSchema>["body"];
