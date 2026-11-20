export const LOAN_STATUSES = ["active", "returned"] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  status: LoanStatus;
  borrowedAt: Date;
  returnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
