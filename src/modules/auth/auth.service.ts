import bcrypt from "bcrypt";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/domain.errors.js";
import { createAccessToken } from "../../utils/jwt.js";
import type { UserDao } from "../users/interfaces/user.dao.interface.js";
import type { PublicUser, UserRole } from "../users/user.entity.js";
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

async function buildAuthResponse(user: PublicUser): Promise<AuthResponse> {
  const accessToken = await createAccessToken(user.id, user.role);
  return {
    user: toAuthUser(user),
    accessToken,
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

    return buildAuthResponse(user);
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await this.userDao.findByEmailWithPassword(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    if (!user.active) {
      throw new ForbiddenError("Cuenta inactiva");
    }

    return buildAuthResponse(user);
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.userDao.findById(userId);
    if (!user || !user.active) {
      throw new NotFoundError("Usuario no encontrado");
    }

    return toAuthUser(user);
  }
}
