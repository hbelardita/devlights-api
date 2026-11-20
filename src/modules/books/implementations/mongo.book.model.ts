import mongoose, { Schema } from "mongoose";

export interface BookRecord {
  title: string;
  author: string;
  year: number;
  genre: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const bookSchema = new Schema<BookRecord>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const BookModel = mongoose.model<BookRecord>("Book", bookSchema);
