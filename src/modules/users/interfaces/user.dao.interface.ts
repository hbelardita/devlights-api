import type { PublicUser, UserRole } from "../user.entity.js";

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export type UpdateUserInput = Partial<CreateUserInput & { active: boolean }>;

export interface UserWithPassword extends PublicUser {
  password: string;
}

export interface UserDao {
  findByEmail(email: string): Promise<PublicUser | null>;
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  findById(id: string): Promise<PublicUser | null>;
  create(data: CreateUserInput): Promise<PublicUser>;
  updateById(id: string, data: UpdateUserInput): Promise<PublicUser | null>;
}
