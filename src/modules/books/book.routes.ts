import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { BookController } from "./book.controller.js";
import {
  bookIdParamSchema,
  createBookSchema,
  listBooksQuerySchema,
  updateBookSchema,
} from "./book.dto.js";
import { BookService } from "./book.service.js";
import { MongoBookDao } from "./implementations/mongo.book.dao.js";

const bookDao = new MongoBookDao();
const bookService = new BookService(bookDao);
const bookController = new BookController(bookService);

export const bookRouter = Router();

bookRouter.get(
  "/",
  validate({ query: listBooksQuerySchema }),
  bookController.getAll,
);
bookRouter.get(
  "/:id",
  validate({ params: bookIdParamSchema }),
  bookController.getById,
);
bookRouter.post(
  "/",
  validate({ body: createBookSchema }),
  bookController.create,
);
bookRouter.put(
  "/:id",
  validate({ params: bookIdParamSchema, body: updateBookSchema }),
  bookController.update,
);
bookRouter.delete(
  "/:id",
  validate({ params: bookIdParamSchema }),
  bookController.remove,
);
