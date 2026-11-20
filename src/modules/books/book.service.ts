import { ConflictError, NotFoundError } from "../../errors/domain.errors.js";
import {
  buildPaginatedResult,
  type PaginatedResult,
} from "../../helpers/pagination.js";
import type {
  CreateBookDto,
  ListBooksQueryDto,
  UpdateBookDto,
} from "./book.dto.js";
import type { Book } from "./book.entity.js";
import type { BookDao } from "./interfaces/book.dao.interface.js";

export class BookService {
  constructor(private readonly bookDao: BookDao) {}

  async getAll(query: ListBooksQueryDto): Promise<PaginatedResult<Book>> {
    const { items, total } = await this.bookDao.findAll(query);
    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async getById(id: string): Promise<Book> {
    const book = await this.bookDao.findById(id);
    if (!book) {
      throw new NotFoundError("Libro no encontrado");
    }
    return book;
  }

  async create(data: CreateBookDto): Promise<Book> {
    return this.bookDao.create(data);
  }

  async updateById(id: string, data: UpdateBookDto): Promise<Book> {
    const book = await this.bookDao.updateById(id, data);
    if (!book) {
      throw new NotFoundError("Libro no encontrado");
    }
    return book;
  }

  async deleteById(id: string): Promise<Book> {
    const existing = await this.bookDao.findById(id);
    if (!existing) {
      throw new NotFoundError("Libro no encontrado");
    }
    if (!existing.available) {
      throw new ConflictError("No se puede eliminar un libro prestado");
    }
    const book = await this.bookDao.deleteById(id);
    if (!book) {
      throw new NotFoundError("Libro no encontrado");
    }
    return book;
  }
}
