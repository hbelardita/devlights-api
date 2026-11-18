import bcrypt from "bcrypt";
import { createAppError } from "../../middlewares/error.middleware.js";
import { createAccessToken } from "../../utils/jwt.js";
import type { UserDao } from "../users/interfaces/user.dao.interface.js";
import type { PublicUser, UserRole } from "../users/user.model.js";
import type { LoginDto, RegisterDto } from "./auth.dto.js";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

function toAuthUser(user: PublicUser): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}

export class AuthService {
  constructor(private readonly userDao: UserDao) {}

  async register(data: RegisterDto): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userDao.create({
      ...data,
      password: hashedPassword,
      role: "user",
    });

    const accessToken = await createAccessToken(user.id, user.role);
    return {
      user: toAuthUser(user),
      accessToken,
    };
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.userDao.findByEmailWithPassword(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw createAppError("Credenciales inválidas", 401);
    }

    if (!user.active) {
      throw createAppError("Cuenta inactiva", 403);
    }

    const accessToken = await createAccessToken(user.id, user.role);
    return {
      user: toAuthUser(user),
      accessToken,
    };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.userDao.findById(userId);
    if (!user || !user.active) {
      throw createAppError("Usuario no encontrado", 404);
    }

    return toAuthUser(user);
  }
}
