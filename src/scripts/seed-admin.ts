import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { MongoUserDao } from "../modules/users/implementations/mongo.user.dao.js";
import type { UserDao } from "../modules/users/interfaces/user.dao.interface.js";

export interface SeedAdminInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SeedAdminResult {
  status: "created" | "exists";
  email: string;
}

export async function seedAdmin(
  userDao: Pick<UserDao, "findByEmail" | "create">,
  input: SeedAdminInput,
): Promise<SeedAdminResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL es obligatorio");
  }
  if (input.password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres");
  }

  const existing = await userDao.findByEmail(email);
  if (existing) {
    return { status: "exists", email };
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  await userDao.create({
    firstName: input.firstName?.trim() || "Admin",
    lastName: input.lastName?.trim() || "Biblioteca",
    email,
    password: hashedPassword,
    role: "admin",
  });

  return { status: "created", email };
}

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";

  await connectDatabase();
  try {
    const result = await seedAdmin(new MongoUserDao(), {
      email,
      password,
      firstName: process.env.ADMIN_FIRST_NAME,
      lastName: process.env.ADMIN_LAST_NAME,
    });

    if (result.status === "exists") {
      console.log(`Admin ya existe: ${result.email}`);
    } else {
      console.log(`Admin creado: ${result.email}`);
    }
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error("Error al ejecutar seed de admin:", err);
    process.exit(1);
  });
}
