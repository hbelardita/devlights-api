import type { Types } from "mongoose";
import { ConflictError } from "../../../errors/domain.errors.js";
import { isMongoDuplicateKeyError } from "../../../helpers/mongo-error.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserDao,
  UserWithPassword,
} from "../interfaces/user.dao.interface.js";
import type { PublicUser } from "../user.entity.js";
import { UserModel, type UserRecord } from "./mongo.user.model.js";

type MongoUserDoc = UserRecord & { _id: Types.ObjectId };

function toPublicUser(doc: MongoUserDoc): PublicUser {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    role: doc.role,
    active: doc.active,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toUserWithPassword(doc: MongoUserDoc): UserWithPassword {
  return {
    ...toPublicUser(doc),
    password: doc.password,
  };
}

export class MongoUserDao implements UserDao {
  async findByEmail(email: string): Promise<PublicUser | null> {
    const doc = await UserModel.findOne({ email }).lean();
    return doc ? toPublicUser(doc) : null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    const doc = await UserModel.findOne({ email }).select("+password").lean();
    return doc ? toUserWithPassword(doc) : null;
  }

  async findById(id: string): Promise<PublicUser | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? toPublicUser(doc) : null;
  }

  async create(data: CreateUserInput): Promise<PublicUser> {
    try {
      const doc = await UserModel.create(data);
      return toPublicUser(doc);
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        throw new ConflictError("El email ya está registrado");
      }
      throw err;
    }
  }

  async updateById(
    id: string,
    data: UpdateUserInput,
  ): Promise<PublicUser | null> {
    try {
      const doc = await UserModel.findByIdAndUpdate(id, data, {
        returnDocument: "after",
        runValidators: true,
      }).lean();
      return doc ? toPublicUser(doc) : null;
    } catch (err) {
      if (isMongoDuplicateKeyError(err)) {
        throw new ConflictError("El email ya está registrado");
      }
      throw err;
    }
  }
}
