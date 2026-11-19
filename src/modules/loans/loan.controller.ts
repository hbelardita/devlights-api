import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../../middlewares/auth.middleware.js";
import type {
  CreateLoanDto,
  ListLoansQueryDto,
  LoanIdParam,
} from "./loan.dto.js";
import type { LoanService } from "./loan.service.js";

export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = res.locals.query as ListLoansQueryDto;
      const actor = res.locals.user as AuthenticatedUser;
      const result = await this.loanService.getAll(query, actor);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request<LoanIdParam>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actor = res.locals.user as AuthenticatedUser;
      const loan = await this.loanService.getById(req.params.id, actor);
      res.status(200).json({ data: loan });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request<unknown, unknown, CreateLoanDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actor = res.locals.user as AuthenticatedUser;
      const loan = await this.loanService.create(req.body, actor);
      res.status(201).json({ data: loan });
    } catch (error) {
      next(error);
    }
  };

  returnLoan = async (
    req: Request<LoanIdParam>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actor = res.locals.user as AuthenticatedUser;
      const loan = await this.loanService.returnLoan(req.params.id, actor);
      res.status(200).json({ data: loan });
    } catch (error) {
      next(error);
    }
  };
}
