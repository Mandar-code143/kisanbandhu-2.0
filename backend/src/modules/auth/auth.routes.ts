import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { authenticate } from "../../middlewares/auth";
import { authLimiter } from "../../middlewares/rateLimiter";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../../validators/auth.schema";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post("/login", authLimiter, validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post("/logout", authenticate, (req, res, next) =>
  authController.logout(req as any, res, next)
);

router.post("/refresh", (req, res, next) =>
  authController.refreshToken(req, res, next)
);

router.post("/send-otp", authLimiter, (req, res, next) =>
  authController.sendOtp(req, res, next)
);

router.post("/verify-email", validate(verifyEmailSchema), (req, res, next) =>
  authController.verifyEmail(req, res, next)
);

router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

router.post("/reset-password", authLimiter, validate(resetPasswordSchema), (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.get("/me", authenticate, (req, res, next) =>
  authController.getMe(req as any, res, next)
);

export default router;
