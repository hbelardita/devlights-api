import type { Request, Response } from "express";
import type {
  BookIdParam,
  CreateBookDto,
  ListBooksQueryDto,
  UpdateBookDto,
} from "./book.dto.js";
import type { BookService } from "./book.service.js";

export class BookController {
  constructor(private readonly bookService: BookService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    const query = res.locals.query as ListBooksQueryDto;
    const result = await this.bookService.getAll(query);
    res.status(200).json(result);
  };

  getById = async (req: Request<BookIdParam>, res: Response): Promise<void> => {
    const book = await this.bookService.getById(req.params.id);
    res.status(200).json({ data: book });
  };

  create = async (
    req: Request<unknown, unknown, CreateBookDto>,
    res: Response,
  ): Promise<void> => {
    const book = await this.bookService.create(req.body);
    res.status(201).json({ data: book });
  };

  update = async (
    req: Request<BookIdParam, unknown, UpdateBookDto>,
    res: Response,
  ): Promise<void> => {
    const book = await this.bookService.updateById(req.params.id, req.body);
    res.status(200).json({ data: book });
  };

  remove = async (req: Request<BookIdParam>, res: Response): Promise<void> => {
    await this.bookService.deleteById(req.params.id);
    res.sendStatus(204);
  };
}
