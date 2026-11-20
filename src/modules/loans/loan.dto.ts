import { z } from "zod";
import {
  objectIdSchema,
  paginationQueryFields,
} from "../../helpers/pagination.js";
import { LOAN_STATUSES } from "./loan.entity.js";

export const loanIdParamSchema = z.object({
  id: objectIdSchema("ID de préstamo inválido"),
});

export const createLoanSchema = z.object({
  bookId: objectIdSchema("ID de libro inválido"),
});

export const listLoansQuerySchema = z.object({
  ...paginationQueryFields,
  status: z.enum(LOAN_STATUSES).optional(),
  bookId: objectIdSchema("ID de libro inválido").optional(),
});

export type LoanIdParam = z.infer<typeof loanIdParamSchema>;
export type CreateLoanDto = z.infer<typeof createLoanSchema>;
export type ListLoansQueryDto = z.infer<typeof listLoansQuerySchema>;
