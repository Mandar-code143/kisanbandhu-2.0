import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { AuthenticatedRequest } from "../../types";
import config from "../../config";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        authService.getRefreshCookieOptions()
      );

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.cookie(
        "refreshToken",
        result.tokens.refreshToken,
        authService.getRefreshCookieOptions()
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }

      res.clearCookie("refreshToken", { path: "/api/v1/auth" });

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: "Refresh token required",
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        authService.getRefreshCookieOptions()
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, purpose } = req.body;
      await authService.sendOtp(email, purpose);

      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      await authService.verifyEmail(email, otp);

      res.status(200).json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: "If the email exists, an OTP has been sent",
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp, password } = req.body;
      await authService.resetPassword(email, otp, password);

      res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
