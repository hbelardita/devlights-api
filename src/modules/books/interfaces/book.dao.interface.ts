import type { CreateBookDto, UpdateBookDto } from "../book.dto.js";

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

export interface BookDao {
  findAll(): Promise<Book[]>;
  findById(id: string): Promise<Book | null>;
  create(data: CreateBookDto): Promise<Book>;
  updateById(id: string, data: UpdateBookDto): Promise<Book | null>;
  deleteById(id: string): Promise<Book | null>;
}
