import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../../middlewares/auth.middleware.js";
import type { LoginDto, RegisterDto } from "./auth.dto.js";
import type { AuthService } from "./auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: Request<unknown, unknown, RegisterDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request<unknown, unknown, LoginDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  };

  me = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authUser = res.locals.user as AuthenticatedUser;
      const user = await this.authService.getMe(authUser.id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      res.status(200).json({ data: { message: "Sesión cerrada correctamente" } });
    } catch (error) {
      next(error);
    }
  };
}
