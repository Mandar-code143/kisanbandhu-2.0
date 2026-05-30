import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse({ body: req.body });
        if (!result.success) {
          const errors = formatZodErrors(result.error);
          throw ApiError.badRequest("Validation failed", errors);
        }
        req.body = result.data.body;
      }

      if (schemas.query) {
        const result = schemas.query.safeParse({ query: req.query });
        if (!result.success) {
          const errors = formatZodErrors(result.error);
          throw ApiError.badRequest("Invalid query parameters", errors);
        }
        req.query = result.data.query;
      }

      if (schemas.params) {
        const result = schemas.params.safeParse({ params: req.params });
        if (!result.success) {
          const errors = formatZodErrors(result.error);
          throw ApiError.badRequest("Invalid path parameters", errors);
        }
        req.params = result.data.params;
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        next(error);
        return;
      }
      next(ApiError.badRequest("Validation failed"));
    }
  };
};

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return errors;
}
