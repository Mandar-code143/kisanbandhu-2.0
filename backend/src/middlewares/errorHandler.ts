import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";
import config from "../config";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    const response: Record<string, unknown> = {
      success: false,
      message: err.message,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    if (config.env === "development") {
      response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
  });

  const statusCode = (err as any).statusCode || 500;
  const message =
    config.env === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (config.env === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
