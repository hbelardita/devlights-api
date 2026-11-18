import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function createAppError(
  message: string,
  statusCode: number,
  details?: unknown,
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  if (details !== undefined) {
    error.details = details;
  }
  return error;
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      error: {
        status: 400,
        message: "JSON inválido en el cuerpo de la solicitud",
      },
    });
    return;
  }

  const appErr = err as AppError;
  const statusCode = appErr.statusCode ?? 500;
  const isProd = env.NODE_ENV === "production";
  const isInternal = statusCode >= 500;
  const message =
    isInternal && isProd
      ? "Error interno del servidor"
      : appErr.message || "Error interno del servidor";

  const logPrefix = `[Error] ${statusCode} - ${appErr.message || "Error interno del servidor"}`;
  if (env.NODE_ENV === "development") {
    console.error(logPrefix, err.stack);
  } else {
    console.error(logPrefix);
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      ...(isInternal && isProd
        ? {}
        : appErr.details
          ? { details: appErr.details }
          : {}),
    },
  });
}
