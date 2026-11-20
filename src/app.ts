import express, { type Application, type Express } from "express";
import helmet from "helmet";
import {
  checkDatabaseHealth,
  type DatabaseHealthStatus,
} from "./config/database.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/logger.middleware.js";
import { notFoundHandler } from "./middlewares/not-found.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { bookRouter } from "./modules/books/book.routes.js";
import { loanRouter } from "./modules/loans/loan.routes.js";

export interface CreateAppOptions {
  checkDatabase?: () => Promise<DatabaseHealthStatus>;
}

export function createApp(options: CreateAppOptions = {}): Application {
  const checkDatabase = options.checkDatabase ?? checkDatabaseHealth;
  const app: Express = express();
  app.use(requestLogger);
  app.use(express.json());
  app.use(helmet());

  app.get("/health", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const timestamp = new Date().toISOString();
    const uptime = Math.floor(process.uptime());

    try {
      const dbStatus = await checkDatabase();
      const isConnected = dbStatus === "connected";

      res.status(isConnected ? 200 : 503).json({
        status: isConnected ? "ok" : "error",
        service: "biblioteca-api",
        timestamp,
        uptime,
        dependencies: {
          database: { status: dbStatus },
        },
      });
    } catch {
      res.status(500).json({
        status: "error",
        service: "biblioteca-api",
        timestamp,
        uptime,
      });
    }
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/books", bookRouter);
  app.use("/api/v1/loans", loanRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
