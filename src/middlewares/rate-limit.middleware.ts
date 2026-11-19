import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { TooManyRequestsError } from "../errors/domain.errors.js";

export interface RateLimitPolicy {
  windowMs: number;
  limit: number;
  message?: string;
}

export function createRateLimiter(policy: RateLimitPolicy): RequestHandler {
  return rateLimit({
    windowMs: policy.windowMs,
    limit: policy.limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new TooManyRequestsError(policy.message));
    },
  });
}
