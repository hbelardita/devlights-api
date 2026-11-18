import express, { type Application, type Express } from "express";
import { errorHandler } from "./middlewares/error.middleware.js";

export function createApp(): Application {
  const app: Express = express();

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "Devlights API",
      status: "ok",
      version: "1.0.0",
    });
  });
  app.use(errorHandler);
  return app;
}
