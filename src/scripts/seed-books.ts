import { fileURLToPath } from "node:url";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import type { CreateBookDto } from "../modules/books/book.dto.js";
import { MongoBookDao } from "../modules/books/implementations/mongo.book.dao.js";
import type { Book } from "../modules/books/book.entity.js";

export type SeedBook = CreateBookDto;

export interface SeedBooksDao {
  findByTitleAndAuthor(title: string, author: string): Promise<Book | null>;
  create(data: CreateBookDto): Promise<Book>;
}

export interface SeedBooksResult {
  created: number;
  existing: number;
}

export const SEED_BOOKS: readonly SeedBook[] = [
  {
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    year: 1967,
    genre: "Novela",
    available: true,
  },
  {
    title: "Rayuela",
    author: "Julio Cortázar",
    year: 1963,
    genre: "Novela",
    available: true,
  },
  {
    title: "Ficciones",
    author: "Jorge Luis Borges",
    year: 1944,
    genre: "Cuento",
    available: true,
  },
  {
    title: "El túnel",
    author: "Ernesto Sabato",
    year: 1948,
    genre: "Novela",
    available: true,
  },
  {
    title: "La casa de los espíritus",
    author: "Isabel Allende",
    year: 1982,
    genre: "Novela",
    available: true,
  },
  {
    title: "Crónica de una muerte anunciada",
    author: "Gabriel García Márquez",
    year: 1981,
    genre: "Novela",
    available: true,
  },
  {
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "Ciencia ficción",
    available: true,
  },
  {
    title: "El principito",
    author: "Antoine de Saint-Exupéry",
    year: 1943,
    genre: "Fábula",
    available: true,
  },
  {
    title: "Martín Fierro",
    author: "José Hernández",
    year: 1872,
    genre: "Poesía",
    available: true,
  },
  {
    title: "La invención de Morel",
    author: "Adolfo Bioy Casares",
    year: 1940,
    genre: "Ciencia ficción",
    available: true,
  },
];

export async function seedBooks(
  dao: SeedBooksDao,
  books: readonly SeedBook[] = SEED_BOOKS,
): Promise<SeedBooksResult> {
  let created = 0;
  let existing = 0;

  for (const book of books) {
    const found = await dao.findByTitleAndAuthor(book.title, book.author);
    if (found) {
      existing += 1;
      continue;
    }

    await dao.create(book);
    created += 1;
  }

  return { created, existing };
}

async function main(): Promise<void> {
  await connectDatabase();
  try {
    const result = await seedBooks(new MongoBookDao());
    console.log(
      `Libros creados: ${result.created}, ya existentes: ${result.existing}`,
    );
  } finally {
    await disconnectDatabase();
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error("Error al ejecutar seed de libros:", err);
    process.exit(1);
  });
}
