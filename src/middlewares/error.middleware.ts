import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  const appErr = err as AppError;
  const statusCode = appErr.statusCode ?? 500;
  const isProd = env.NODE_ENV === "production";
  const isInternal = statusCode >= 500;
  const message =
    isInternal && isProd
      ? "Internal Server Error"
      : appErr.message || "Internal Server Error";

  console.error(
    `[Error] ${statusCode} - ${appErr.message || "Internal Server Error"}`,
    err.stack,
  );

  res.status(statusCode).json({
    error: {
      message,
      ...(isInternal && isProd
        ? {}
        : appErr.details
          ? { details: appErr.details }
          : {}),
    },
  });
}
