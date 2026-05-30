import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    role: z.enum(["FARMER", "WORKER", "CONTRACTOR"]),
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().optional(),
    phone: z
      .string()
      .regex(/^\+?[\d\s-]{10,15}$/, "Invalid phone number"),
    languagePref: z.enum(["mr", "hi", "en"]).optional(),
    district: z.string().optional(),
    taluka: z.string().optional(),
    village: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
    purpose: z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET", "PHONE_VERIFICATION"]),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>["body"];
