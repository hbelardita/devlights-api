import { createAppError } from "../../middlewares/error.middleware.js";
import type { CreateBookDto, UpdateBookDto } from "./book.dto.js";
import type { Book, BookDao } from "./interfaces/book.dao.interface.js";

export class BookService {
  constructor(private readonly bookDao: BookDao) {}

  async getAll(): Promise<Book[]> {
    return this.bookDao.findAll();
  }

  async getById(id: string): Promise<Book> {
    const book = await this.bookDao.findById(id);
    if (!book) {
      throw createAppError("Libro no encontrado", 404);
    }
    return book;
  }

  async create(data: CreateBookDto): Promise<Book> {
    return this.bookDao.create(data);
  }

  async updateById(id: string, data: UpdateBookDto): Promise<Book> {
    const book = await this.bookDao.updateById(id, data);
    if (!book) {
      throw createAppError("Libro no encontrado", 404);
    }
    return book;
  }

  async deleteById(id: string): Promise<Book> {
    const book = await this.bookDao.deleteById(id);
    if (!book) {
      throw createAppError("Libro no encontrado", 404);
    }
    return book;
  }
}
