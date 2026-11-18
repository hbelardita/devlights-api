import type {
  CreateBookDto,
  ListBooksQueryDto,
  UpdateBookDto,
} from "../book.dto.js";

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BookFindAllResult {
  items: Book[];
  total: number;
}

export interface BookDao {
  findAll(query: ListBooksQueryDto): Promise<BookFindAllResult>;
  findById(id: string): Promise<Book | null>;
  create(data: CreateBookDto): Promise<Book>;
  updateById(id: string, data: UpdateBookDto): Promise<Book | null>;
  deleteById(id: string): Promise<Book | null>;
}
