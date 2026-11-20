import { z } from "zod";

export const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export function objectIdSchema(message: string) {
  return z.string().regex(OBJECT_ID_REGEX, message);
}

export function parseIntQuery(val: unknown): unknown {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) {
    return val;
  }
  return Number(trimmed);
}

export const paginationQueryFields = {
  page: z
    .preprocess(
      parseIntQuery,
      z
        .number({ error: "page debe ser un número entero" })
        .int("page debe ser un número entero")
        .min(1, "page debe ser mayor o igual a 1"),
    )
    .default(1),
  limit: z
    .preprocess(
      parseIntQuery,
      z
        .number({ error: "limit debe ser un número entero" })
        .int("limit debe ser un número entero")
        .min(1, "limit debe ser mayor o igual a 1")
        .max(100, "limit no puede superar 100"),
    )
    .default(10),
};

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data: items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
