import type { Types } from "mongoose";
import type {
  BookSortField,
  CreateBookDto,
  ListBooksQueryDto,
  SortOrder,
  UpdateBookDto,
} from "../book.dto.js";
import { BookModel, type BookRecord } from "../book.model.js";
import type {
  Book,
  BookDao,
  BookFindAllResult,
} from "../interfaces/book.dao.interface.js";

type MongoBookDoc = BookRecord & { _id: Types.ObjectId };

const SORT_FIELD_MAP: Record<BookSortField, keyof BookRecord> = {
  title: "title",
  year: "year",
  createdAt: "createdAt",
};

const SORT_ORDER_MAP: Record<SortOrder, 1 | -1> = {
  asc: 1,
  desc: -1,
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
  async findAll(query: ListBooksQueryDto): Promise<BookFindAllResult> {
    const filter: Record<string, unknown> = {};

    if (query.genre !== undefined) {
      filter.genre = query.genre;
    }
    if (query.author !== undefined) {
      filter.author = query.author;
    }
    if (query.available !== undefined) {
      filter.available = query.available;
    }
    if (
      query.year !== undefined ||
      query.yearFrom !== undefined ||
      query.yearTo !== undefined
    ) {
      const yearFilter: { $eq?: number; $gte?: number; $lte?: number } = {};
      if (query.year !== undefined) yearFilter.$eq = query.year;
      if (query.yearFrom !== undefined) yearFilter.$gte = query.yearFrom;
      if (query.yearTo !== undefined) yearFilter.$lte = query.yearTo;
      filter.year = yearFilter;
    }
    if (query.search !== undefined) {
      filter.title = {
        $regex: escapeRegex(query.search),
        $options: "i",
      };
    }

    const sortField = SORT_FIELD_MAP[query.sortBy];
    const sortDirection = SORT_ORDER_MAP[query.order];
    const sort: Record<string, 1 | -1> = {
      [sortField]: sortDirection,
      _id: sortDirection,
    };

    const skip = (query.page - 1) * query.limit;

    const [docs, total] = await Promise.all([
      BookModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
      BookModel.countDocuments(filter),
    ]);

    return {
      items: docs.map(toBook),
      total,
    };
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
