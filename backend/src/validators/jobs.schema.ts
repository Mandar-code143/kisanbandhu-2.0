import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000),
    jobType: z.enum(["DAILY", "CONTRACT", "SEASONAL"]),
    location: z.string().min(1, "Location is required"),
    salary: z.number().positive("Salary must be positive").optional(),
    salaryType: z.enum(["PER_DAY", "PER_MONTH", "FIXED_CONTRACT"]),
    slots: z.number().int().positive().default(1),
    district: z.string().optional(),
    taluka: z.string().optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    jobType: z.enum(["DAILY", "CONTRACT", "SEASONAL"]).optional(),
    location: z.string().optional(),
    salary: z.number().positive().optional(),
    salaryType: z.enum(["PER_DAY", "PER_MONTH", "FIXED_CONTRACT"]).optional(),
    status: z.enum(["OPEN", "CLOSED", "COMPLETED"]).optional(),
    slots: z.number().int().positive().optional(),
    district: z.string().optional(),
    taluka: z.string().optional(),
  }),
});

export const jobQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["OPEN", "CLOSED", "COMPLETED"]).optional(),
    jobType: z.enum(["DAILY", "CONTRACT", "SEASONAL"]).optional(),
    district: z.string().optional(),
    taluka: z.string().optional(),
    search: z.string().optional(),
    postedById: z.string().optional(),
  }),
});

export const applyJobSchema = z.object({
  body: z.object({
    coverLetter: z.string().max(2000).optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateApplicationSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
    notes: z.string().max(1000).optional(),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>["body"];
export type UpdateJobInput = z.infer<typeof updateJobSchema>["body"];
export type JobQueryInput = z.infer<typeof jobQuerySchema>["query"];
export type ApplyJobInput = z.infer<typeof applyJobSchema>["body"];
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>["body"];
