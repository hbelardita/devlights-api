import { z } from "zod";
import { LOAN_STATUSES } from "./loan.model.js";

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const loanIdParamSchema = z.object({
  id: z.string().regex(OBJECT_ID_REGEX, "ID de préstamo inválido"),
});

export const createLoanSchema = z.object({
  bookId: z.string().regex(OBJECT_ID_REGEX, "ID de libro inválido"),
});

function parseIntQuery(val: unknown): unknown {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) {
    return val;
  }
  return Number(trimmed);
}

export const listLoansQuerySchema = z.object({
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
  status: z.enum(LOAN_STATUSES).optional(),
  bookId: z.string().regex(OBJECT_ID_REGEX, "ID de libro inválido").optional(),
});

export type LoanIdParam = z.infer<typeof loanIdParamSchema>;
export type CreateLoanDto = z.infer<typeof createLoanSchema>;
export type ListLoansQueryDto = z.infer<typeof listLoansQuerySchema>;
