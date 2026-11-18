import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/domain.errors.js";
import type { UserRole } from "../modules/users/user.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

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
    next(new UnauthorizedError("Token de autenticación requerido"));
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    next(new UnauthorizedError("Token de autenticación requerido"));
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
    next(new UnauthorizedError("Token inválido o expirado"));
  }
}
