import { fileURLToPath } from "node:url";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { MongoBookDao } from "../modules/books/implementations/mongo.book.dao.js";
import { MongoUserDao } from "../modules/users/implementations/mongo.user.dao.js";
import { seedAdmin } from "./seed-admin.js";
import { seedBooks } from "./seed-books.js";

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const admin = await seedAdmin(new MongoUserDao(), {
      email: process.env.ADMIN_EMAIL ?? "",
      password: process.env.ADMIN_PASSWORD ?? "",
      firstName: process.env.ADMIN_FIRST_NAME,
      lastName: process.env.ADMIN_LAST_NAME,
    });

    if (admin.status === "exists") {
      console.log(`Admin ya existe: ${admin.email}`);
    } else {
      console.log(`Admin creado: ${admin.email}`);
    }

    const books = await seedBooks(new MongoBookDao());
    console.log(
      `Libros creados: ${books.created}, ya existentes: ${books.existing}`,
    );
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error("Error al ejecutar seed:", err);
    process.exit(1);
  });
}
