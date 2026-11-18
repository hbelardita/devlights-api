import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../modules/users/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { createAppError } from "./error.middleware.js";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(createAppError("Token de autenticación requerido", 401));
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    next(createAppError("Token de autenticación requerido", 401));
    return;
  }

  try {
    const payload = await verifyAccessToken(token);
    res.locals.user = {
      id: payload.sub,
      role: payload.role,
    } satisfies AuthenticatedUser;
    next();
  } catch {
    next(createAppError("Token inválido o expirado", 401));
  }
}
