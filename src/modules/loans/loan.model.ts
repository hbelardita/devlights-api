import mongoose, { Schema, type Types } from "mongoose";

export const LOAN_STATUSES = ["active", "returned"] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export interface LoanRecord {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
  status: LoanStatus;
  borrowedAt: Date;
  returnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const loanSchema = new Schema<LoanRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    status: {
      type: String,
      enum: LOAN_STATUSES,
      default: "active",
      required: true,
    },
    borrowedAt: { type: Date, default: () => new Date(), required: true },
    returnedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

loanSchema.index({ userId: 1, status: 1 });
loanSchema.index({ bookId: 1 });

export const LoanModel = mongoose.model<LoanRecord>("Loan", loanSchema);
