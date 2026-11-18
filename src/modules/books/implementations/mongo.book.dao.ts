import type { Types } from "mongoose";
import type { CreateBookDto, UpdateBookDto } from "../book.dto.js";
import { BookModel, type BookRecord } from "../book.model.js";
import type { Book, BookDao } from "../interfaces/book.dao.interface.js";

type MongoBookDoc = BookRecord & { _id: Types.ObjectId };

function toBook(doc: MongoBookDoc): Book {
  return {
    id: doc._id.toString(),
    title: doc.title,
    author: doc.author,
    year: doc.year,
    genre: doc.genre,
    available: doc.available,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoBookDao implements BookDao {
  async findAll(): Promise<Book[]> {
    const docs = await BookModel.find().lean();
    return docs.map(toBook);
  }

  async findById(id: string): Promise<Book | null> {
    const doc = await BookModel.findById(id).lean();
    return doc ? toBook(doc) : null;
  }

  async create(data: CreateBookDto): Promise<Book> {
    const doc = await BookModel.create(data);
    return toBook(doc);
  }

  async updateById(id: string, data: UpdateBookDto): Promise<Book | null> {
    const doc = await BookModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
    return doc ? toBook(doc) : null;
  }

  async deleteById(id: string): Promise<Book | null> {
    const doc = await BookModel.findByIdAndDelete(id).lean();
    return doc ? toBook(doc) : null;
  }
}
