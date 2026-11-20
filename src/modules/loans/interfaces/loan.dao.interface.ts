import type { Loan, LoanStatus } from "../loan.entity.js";

export interface CreateLoanInput {
  userId: string;
  bookId: string;
  borrowedAt?: Date;
}

export interface LoanFindAllFilter {
  page: number;
  limit: number;
  status?: LoanStatus;
  userId?: string;
  bookId?: string;
}

export interface LoanFindAllResult {
  items: Loan[];
  total: number;
}

export interface LoanDao {
  findAll(filter: LoanFindAllFilter): Promise<LoanFindAllResult>;
  findById(id: string): Promise<Loan | null>;
  countActiveByUser(userId: string): Promise<number>;
  create(data: CreateLoanInput): Promise<Loan>;
  markReturned(id: string, returnedAt: Date): Promise<Loan | null>;
}
