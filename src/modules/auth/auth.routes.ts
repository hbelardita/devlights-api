import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { MongoUserDao } from "../users/implementations/mongo.user.dao.js";
import { AuthController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.dto.js";
import { AuthService } from "./auth.service.js";

const userDao = new MongoUserDao();
const authService = new AuthService(userDao);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post(
  "/register",
  validate({ body: registerSchema }),
  authController.register,
);
authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  authController.login,
);
authRouter.get("/me", authenticate, authController.me);
authRouter.post("/logout", authenticate, authController.logout);
