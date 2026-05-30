import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { ApiError } from "../utils/ApiError";
import { JwtPayload, AuthenticatedRequest } from "../types";

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("No token provided");
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized("Token expired"));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized("Invalid token"));
      return;
    }
    next(ApiError.unauthorized("Authentication failed"));
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    // Silently fail - user stays unauthenticated
  }

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden("You do not have permission to access this resource"));
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole("ADMIN");

export const requireFarmer = requireRole("FARMER", "ADMIN");

export const requireWorker = requireRole("WORKER", "ADMIN");

export const requireContractor = requireRole("CONTRACTOR", "ADMIN");
