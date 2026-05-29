import z from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es obligatorio." })
    .max(120, { error: "El nombre no puede superar 120 caracteres." }),
  image_url: z
    .union([z.string().min(1), z.literal(""), z.null()])
    .optional()
    .transform((value) => {
      if (value === "" || value === undefined) {
        return null;
      }
      return value;
    }),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.uuid({ error: "Identificador no válido." }),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
