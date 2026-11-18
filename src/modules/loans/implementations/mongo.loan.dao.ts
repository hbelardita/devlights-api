import type { Types } from "mongoose";
import type {
  CreateLoanInput,
  Loan,
  LoanDao,
  LoanFindAllFilter,
  LoanFindAllResult,
} from "../interfaces/loan.dao.interface.js";
import { LoanModel, type LoanRecord } from "../loan.model.js";

type MongoLoanDoc = LoanRecord & { _id: Types.ObjectId };

function toLoan(doc: MongoLoanDoc): Loan {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    bookId: doc.bookId.toString(),
    status: doc.status,
    borrowedAt: doc.borrowedAt,
    returnedAt: doc.returnedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoLoanDao implements LoanDao {
  async findAll(filter: LoanFindAllFilter): Promise<LoanFindAllResult> {
    const mongoFilter: Record<string, unknown> = {};

    if (filter.status !== undefined) {
      mongoFilter.status = filter.status;
    }
    if (filter.userId !== undefined) {
      mongoFilter.userId = filter.userId;
    }
    if (filter.bookId !== undefined) {
      mongoFilter.bookId = filter.bookId;
    }

    const skip = (filter.page - 1) * filter.limit;
    const sort: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };

    const [docs, total] = await Promise.all([
      LoanModel.find(mongoFilter)
        .sort(sort)
        .skip(skip)
        .limit(filter.limit)
        .lean(),
      LoanModel.countDocuments(mongoFilter),
    ]);

    return {
      items: docs.map(toLoan),
      total,
    };
  }

  async findById(id: string): Promise<Loan | null> {
    const doc = await LoanModel.findById(id).lean();
    return doc ? toLoan(doc) : null;
  }

  async countActiveByUser(userId: string): Promise<number> {
    return LoanModel.countDocuments({ userId, status: "active" });
  }

  async create(data: CreateLoanInput): Promise<Loan> {
    const doc = await LoanModel.create({
      userId: data.userId,
      bookId: data.bookId,
      ...(data.borrowedAt !== undefined ? { borrowedAt: data.borrowedAt } : {}),
    });
    return toLoan(doc);
  }

  async markReturned(id: string, returnedAt: Date): Promise<Loan | null> {
    const doc = await LoanModel.findOneAndUpdate(
      { _id: id, status: "active" },
      { status: "returned", returnedAt },
      { returnDocument: "after" },
    ).lean();
    return doc ? toLoan(doc) : null;
  }
}
