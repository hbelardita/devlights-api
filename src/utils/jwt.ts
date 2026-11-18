import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "../config/env.js";
import { USER_ROLES, type UserRole } from "../modules/users/user.model.js";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: UserRole;
}

export async function createAccessToken(
  userId: string,
  role: UserRole,
): Promise<string> {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secretKey);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });

  if (
    typeof payload.sub !== "string" ||
    !USER_ROLES.includes(payload.role as UserRole)
  ) {
    throw new Error("Token inválido");
  }

  return payload as AccessTokenPayload;
}
