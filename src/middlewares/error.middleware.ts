import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../errors/domain.errors.js";

export function errorHandler(
  err: Error,
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

  const isHttpError = err instanceof HttpError;
  const statusCode = isHttpError ? err.statusCode : 500;
  const details = isHttpError ? err.details : undefined;
  const isProd = env.NODE_ENV === "production";
  const isInternal = statusCode >= 500;
  const message =
    isInternal && isProd
      ? "Error interno del servidor"
      : err.message || "Error interno del servidor";

  const logPrefix = `[Error] ${statusCode} - ${err.message || "Error interno del servidor"}`;
  if (env.NODE_ENV === "development") {
    console.error(logPrefix, err.stack);
  }

  res.status(statusCode).json({
    error: {
      status: statusCode,
      message,
      ...(isInternal && isProd ? {} : details ? { details } : {}),
    },
  });
}
