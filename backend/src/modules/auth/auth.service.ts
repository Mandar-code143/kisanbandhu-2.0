import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../config/database";
import config from "../../config";
import { ApiError } from "../../utils/ApiError";
import { JwtPayload, TokenPair } from "../../types";
import { RegisterInput, LoginInput } from "../../validators/auth.schema";
import logger from "../../utils/logger";

export class AuthService {
  async register(input: RegisterInput): Promise<{
    user: { id: string; email: string | null; phone: string; role: string };
    tokens: TokenPair;
  }> {
    if (input.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser) {
        throw ApiError.conflict("User with this email already exists");
      }
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) {
      throw ApiError.conflict("User with this phone number already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, config.bcrypt.saltRounds);

    const user = await prisma.user.create({
      data: {
        email: input.email || null,
        phone: input.phone,
        passwordHash,
        role: input.role,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName || "",
            phone: input.phone,
            languagePref: input.languagePref || "mr",
            district: input.district || null,
            taluka: input.taluka || null,
            village: input.village || null,
          },
        },
        ...(input.role === "FARMER" && {
          farmer: { create: { cropTypes: "[]" } },
        }),
        ...(input.role === "WORKER" && {
          worker: { create: { skills: "[]" } },
        }),
        ...(input.role === "CONTRACTOR" && {
          contractor: { create: { specialization: "[]" } },
        }),
      },
      include: {
        profile: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email || "", user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info(`User registered: ${user.phone} (${user.role})`);

    return {
      user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
      tokens,
    };
  }

  async login(input: LoginInput): Promise<{
    user: { id: string; email: string | null; phone: string; role: string; profile: any };
    tokens: TokenPair;
  }> {
    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
      include: { profile: true },
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid phone number or password");
    }

    if (user.deletedAt) {
      throw ApiError.unauthorized("Account has been deactivated");
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const tokens = await this.generateTokens(user.id, user.email || "", user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info(`User logged in: ${user.phone}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile: user.profile,
      },
      tokens,
    };
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.info(`User logged out: ${userId}`);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken || user.deletedAt) {
        throw ApiError.unauthorized("Invalid refresh token");
      }

      const tokens = await this.generateTokens(user.id, user.email || "", user.role || "FARMER");

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unauthorized("Invalid refresh token");
    }
  }

  async verifyEmail(email: string, otp: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    if (user.isVerified) {
      return;
    }

    const validOtp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code: otp,
        purpose: "EMAIL_VERIFICATION",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    await prisma.$transaction([
      prisma.oTP.update({
        where: { id: validOtp.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
    ]);

    logger.info(`Email verified: ${email}`);
  }

  async sendOtp(email: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "PHONE_VERIFICATION"): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      if (purpose === "EMAIL_VERIFICATION") {
        throw ApiError.notFound("User not found");
      }
      return;
    }

    const code = crypto.randomInt(100000, 999999).toString();

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    logger.info(`OTP sent to ${email} for ${purpose}: ${code}`);

    // In production, send via email/SMS here
    console.log(`[DEV] OTP for ${email} (${purpose}): ${code}`);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    await this.sendOtp(email, "PASSWORD_RESET");
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const validOtp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code: otp,
        purpose: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!validOtp) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    await prisma.$transaction([
      prisma.oTP.update({
        where: { id: validOtp.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, refreshToken: null },
      }),
    ]);

    logger.info(`Password reset completed: ${email}`);
  }

  async generateTokens(userId: string, email: string, role: string): Promise<TokenPair> {
    const payload: JwtPayload = { userId, email, role: role as JwtPayload["role"] };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry as any,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry as any,
    });

    return { accessToken, refreshToken };
  }

  getRefreshCookieOptions() {
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    return {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "strict" as const : "lax" as const,
      maxAge,
      path: "/api/v1/auth",
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: true,
        farmer: true,
        worker: true,
        contractor: true,
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }
}

export const authService = new AuthService();
