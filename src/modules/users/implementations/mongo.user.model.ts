import mongoose, { Schema } from "mongoose";
import { USER_ROLES, type UserRole } from "../user.entity.js";

export interface UserRecord {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const userSchema = new Schema<UserRecord>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "user", required: true },
    active: { type: Boolean, default: true, required: true },
  },
  {
    timestamps: true,
  },
);

export const UserModel = mongoose.model<UserRecord>("User", userSchema);
