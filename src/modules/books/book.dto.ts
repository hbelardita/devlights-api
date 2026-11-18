import { z } from "zod";

export const bookIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "ID de libro inválido"),
});

export const createBookSchema = z.object({
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
  available: z
    .boolean({ error: "El campo available debe ser booleano" })
    .default(true),
});

export const updateBookSchema = createBookSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo",
  });

export type CreateBookDto = z.infer<typeof createBookSchema>;
export type UpdateBookDto = z.infer<typeof updateBookSchema>;
export type BookIdParam = z.infer<typeof bookIdParamSchema>;
