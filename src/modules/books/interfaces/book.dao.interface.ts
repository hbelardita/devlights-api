import type {
  CreateBookDto,
  ListBooksQueryDto,
  UpdateBookDto,
} from "../book.dto.js";
import type { Book } from "../book.entity.js";

export type {
  PaginatedResult,
  PaginationMeta,
} from "../../../helpers/pagination.js";

export interface BookFindAllResult {
  items: Book[];
  total: number;
}

export interface BookDao {
  findAll(query: ListBooksQueryDto): Promise<BookFindAllResult>;
  findById(id: string): Promise<Book | null>;
  create(data: CreateBookDto): Promise<Book>;
  updateById(id: string, data: UpdateBookDto): Promise<Book | null>;
  setAvailability(
    id: string,
    expectedAvailable: boolean,
    nextAvailable: boolean,
  ): Promise<Book | null>;
  deleteById(id: string): Promise<Book | null>;
}
