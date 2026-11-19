import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { createRateLimiter } from "../../middlewares/rate-limit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { MongoUserDao } from "../users/implementations/mongo.user.dao.js";
import { AuthController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.dto.js";
import { AuthService } from "./auth.service.js";

const userDao = new MongoUserDao();
const authService = new AuthService(userDao);
const authController = new AuthController(authService);

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

export const authRouter = Router();

authRouter.post(
  "/register",
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register,
);
authRouter.post(
  "/login",
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login,
);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/logout", authenticate, authController.logout);
