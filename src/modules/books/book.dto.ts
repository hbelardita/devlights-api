import { z } from "zod";
import {
  objectIdSchema,
  paginationQueryFields,
  parseIntQuery,
} from "../../helpers/pagination.js";

export const bookIdParamSchema = z.object({
  id: objectIdSchema("ID de libro inválido"),
});

const bookShape = {
  title: z.string().trim().min(1, "El título es obligatorio"),
  author: z.string().trim().min(1, "El autor es obligatorio"),
  year: z
    .number({ error: "El año debe ser un número válido" })
    .int("El año debe ser un número entero")
    .min(1, "El año debe ser mayor a 0")
    .max(
      new Date().getFullYear() + 1,
      "El año no puede superar el próximo año",
    ),
  genre: z.string().trim().min(1, "El género es obligatorio"),
  available: z.boolean({ error: "El campo available debe ser booleano" }),
};

export const createBookSchema = z.object({
  ...bookShape,
  available: bookShape.available.default(true),
});

export const updateBookSchema = z
  .object(bookShape)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo",
  });

export const BOOK_SORT_FIELDS = ["title", "year", "createdAt"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export type BookSortField = (typeof BOOK_SORT_FIELDS)[number];
export type SortOrder = (typeof SORT_ORDERS)[number];

const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1, "El filtro no puede estar vacío")
  .optional();

const optionalIntQuery = z
  .preprocess(
    parseIntQuery,
    z
      .number({ error: "Debe ser un número entero válido" })
      .int("Debe ser un número entero válido"),
  )
  .optional();

export const listBooksQuerySchema = z
  .object({
    ...paginationQueryFields,
    genre: optionalNonEmptyString,
    author: optionalNonEmptyString,
    available: z
      .enum(["true", "false"], {
        error: "available debe ser 'true' o 'false'",
      })
      .transform((val) => val === "true")
      .optional(),
    year: optionalIntQuery,
    yearFrom: optionalIntQuery,
    yearTo: optionalIntQuery,
    search: optionalNonEmptyString,
    sortBy: z.enum(BOOK_SORT_FIELDS).default("createdAt"),
    order: z.enum(SORT_ORDERS).default("desc"),
  })
  .refine(
    (data) =>
      data.yearFrom === undefined ||
      data.yearTo === undefined ||
      data.yearFrom <= data.yearTo,
    {
      message: "yearFrom no puede ser mayor que yearTo",
      path: ["yearFrom"],
    },
  );

export type CreateBookDto = z.infer<typeof createBookSchema>;
export type UpdateBookDto = z.infer<typeof updateBookSchema>;
export type BookIdParam = z.infer<typeof bookIdParamSchema>;
export type ListBooksQueryDto = z.infer<typeof listBooksQuerySchema>;
