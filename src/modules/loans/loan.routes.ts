import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { MongoBookDao } from "../books/implementations/mongo.book.dao.js";
import { MongoLoanDao } from "./implementations/mongo.loan.dao.js";
import { LoanController } from "./loan.controller.js";
import {
  createLoanSchema,
  listLoansQuerySchema,
  loanIdParamSchema,
} from "./loan.dto.js";
import { LoanService } from "./loan.service.js";

const loanDao = new MongoLoanDao();
const bookDao = new MongoBookDao();
const loanService = new LoanService(loanDao, bookDao);
const loanController = new LoanController(loanService);

export const loanRouter = Router();

loanRouter.use(authenticate);

loanRouter.get(
  "/",
  validate({ query: listLoansQuerySchema }),
  loanController.getAll,
);
loanRouter.get(
  "/:id",
  validate({ params: loanIdParamSchema }),
  loanController.getById,
);
loanRouter.post(
  "/",
  validate({ body: createLoanSchema }),
  loanController.create,
);
loanRouter.patch(
  "/:id/return",
  validate({ params: loanIdParamSchema }),
  loanController.returnLoan,
);
