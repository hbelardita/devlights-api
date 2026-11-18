import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/domain.errors.js";
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

export function authorize(...allowedRoles: UserRole[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user as AuthenticatedUser | undefined;
    if (!user) {
      next(new UnauthorizedError("Token de autenticación requerido"));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new ForbiddenError("No tienes permisos para realizar esta acción"));
      return;
    }

    next();
  };
}
