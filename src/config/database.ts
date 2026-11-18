import mongoose from "mongoose";
import { env } from "./env.js";

export type DatabaseHealthStatus = "connected" | "disconnected";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return "disconnected";
  }

  try {
    await mongoose.connection.db.admin().ping();
    return "connected";
  } catch {
    return "disconnected";
  }
}
