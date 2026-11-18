import type { NextFunction, Request, Response } from "express";
import { z, type ZodType } from "zod";
import { BadRequestError } from "../errors/domain.errors.js";

z.config(z.locales.es());

export type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

type ValidationDetail = {
  field: string;
  message: string;
};

const PARTS = ["body", "params", "query"] as const;

export function validate(schemas: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const details: ValidationDetail[] = [];
    const parsed: Partial<Record<(typeof PARTS)[number], unknown>> = {};

    for (const part of PARTS) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          details.push({
            field:
              issue.path.length > 0 ? `${part}.${issue.path.join(".")}` : part,
            message: issue.message,
          });
        }
        continue;
      }

      parsed[part] = result.data;
    }

    if (details.length > 0) {
      next(new BadRequestError("Error de validación", details));
      return;
    }

    if ("body" in parsed) {
      req.body = parsed.body;
    }
    if ("params" in parsed) {
      req.params = parsed.params as Request["params"];
      res.locals.params = parsed.params;
    }
    if ("query" in parsed) {
      res.locals.query = parsed.query;
    }

    next();
  };
}
