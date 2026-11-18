import express, { type Application, type Express } from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { bookRouter } from "./modules/books/book.routes.js";
import { loanRouter } from "./modules/loans/loan.routes.js";

export function createApp(): Application {
  const app: Express = express();
  app.use(requestLogger);
  app.use(express.json());
  app.use(helmet());

  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "Devlights API",
      status: "ok",
      version: "1.0.0",
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/books", bookRouter);
  app.use("/api/v1/loans", loanRouter);
  app.use(errorHandler);
  return app;
}
