import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

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
            field: issue.path.length > 0 ? `${part}.${issue.path.join(".")}` : part,
            message: issue.message,
          });
        }
        continue;
      }

      parsed[part] = result.data;
    }

    if (details.length > 0) {
      res.status(400).json({
        error: {
          status: 400,
          message: "Error de validación",
          details,
        },
      });
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
      // Express 5 exposes req.query as a read-only getter, so store validated query on res.locals.
      res.locals.query = parsed.query;
    }

    next();
  };
}
