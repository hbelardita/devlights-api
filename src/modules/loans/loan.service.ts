import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors/domain.errors.js";
import type { AuthenticatedUser } from "../../middlewares/auth.middleware.js";
import type {
  BookDao,
  PaginatedResult,
} from "../books/interfaces/book.dao.interface.js";
import type {
  LoanDao,
  LoanFindAllFilter,
} from "./interfaces/loan.dao.interface.js";
import type { CreateLoanDto, ListLoansQueryDto } from "./loan.dto.js";
import type { Loan } from "./loan.entity.js";

export const MAX_ACTIVE_LOANS_PER_USER = 3;

export class LoanService {
  constructor(
    private readonly loanDao: LoanDao,
    private readonly bookDao: BookDao,
  ) {}

  async getAll(
    query: ListLoansQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedResult<Loan>> {
    const filter: LoanFindAllFilter = {
      page: query.page,
      limit: query.limit,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.bookId !== undefined ? { bookId: query.bookId } : {}),
      ...(actor.role !== "admin" ? { userId: actor.id } : {}),
    };

    const { items, total } = await this.loanDao.findAll(filter);
    const totalPages = Math.ceil(total / query.limit);

    return {
      data: items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    };
  }

  async getById(id: string, actor: AuthenticatedUser): Promise<Loan> {
    const loan = await this.loanDao.findById(id);
    if (!loan) {
      throw new NotFoundError("Préstamo no encontrado");
    }
    if (actor.role !== "admin" && loan.userId !== actor.id) {
      throw new ForbiddenError();
    }
    return loan;
  }

  async create(data: CreateLoanDto, actor: AuthenticatedUser): Promise<Loan> {
    const book = await this.bookDao.findById(data.bookId);
    if (!book) {
      throw new NotFoundError("Libro no encontrado");
    }

    const activeLoans = await this.loanDao.countActiveByUser(actor.id);
    if (activeLoans >= MAX_ACTIVE_LOANS_PER_USER) {
      throw new ConflictError(
        "Has alcanzado el límite máximo de préstamos activos",
      );
    }

    const reserved = await this.bookDao.setAvailability(
      data.bookId,
      true,
      false,
    );
    if (!reserved) {
      throw new ConflictError("El libro no está disponible para préstamo");
    }

    try {
      return await this.loanDao.create({
        userId: actor.id,
        bookId: data.bookId,
        borrowedAt: new Date(),
      });
    } catch (err) {
      await this.bookDao.setAvailability(data.bookId, false, true);
      throw err;
    }
  }

  async returnLoan(id: string, actor: AuthenticatedUser): Promise<Loan> {
    const loan = await this.loanDao.findById(id);
    if (!loan) {
      throw new NotFoundError("Préstamo no encontrado");
    }
    if (actor.role !== "admin" && loan.userId !== actor.id) {
      throw new ForbiddenError();
    }
    if (loan.status === "returned") {
      throw new ConflictError("El préstamo ya fue devuelto");
    }

    const updated = await this.loanDao.markReturned(id, new Date());
    if (!updated) {
      throw new ConflictError("El préstamo ya fue devuelto");
    }

    await this.bookDao.setAvailability(loan.bookId, false, true);
    return updated;
  }
}
