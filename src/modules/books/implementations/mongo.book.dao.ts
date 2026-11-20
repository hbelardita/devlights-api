import type { Types } from "mongoose";
import { ConflictError } from "../../../errors/domain.errors.js";
import { isMongoDuplicateKeyError } from "../../../helpers/mongo-error.js";
import type {
  BookSortField,
  CreateBookDto,
  ListBooksQueryDto,
  SortOrder,
  UpdateBookDto,
} from "../book.dto.js";
import { BookModel, type BookRecord } from "./mongo.book.model.js";
import type { Book } from "../book.entity.js";
import type {
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

  async findByTitleAndAuthor(
    title: string,
    author: string,
  ): Promise<Book | null> {
    const doc = await BookModel.findOne({
      title: title.trim(),
      author: author.trim(),
    }).lean();
    return doc ? toBook(doc) : null;
  }

  async findById(id: string): Promise<Book | null> {
    const doc = await BookModel.findById(id).lean();
    return doc ? toBook(doc) : null;
  }

  async create(data: CreateBookDto): Promise<Book> {
    try {
      const doc = await BookModel.create(data);
      return toBook(doc);
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        throw new ConflictError("El libro ya existe");
      }
      throw err;
    }
  }

  async updateById(id: string, data: UpdateBookDto): Promise<Book | null> {
    try {
      const doc = await BookModel.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true,
      }).lean();
      return doc ? toBook(doc) : null;
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        throw new ConflictError("El libro ya existe");
      }
      throw err;
    }
  }

  async setAvailability(
    id: string,
    expectedAvailable: boolean,
    nextAvailable: boolean,
  ): Promise<Book | null> {
    const doc = await BookModel.findOneAndUpdate(
      { _id: id, available: expectedAvailable },
      { available: nextAvailable },
      { returnDocument: "after" },
    ).lean();
    return doc ? toBook(doc) : null;
  }

  async deleteById(id: string): Promise<Book | null> {
    const doc = await BookModel.findByIdAndDelete(id).lean();
    return doc ? toBook(doc) : null;
  }
}
