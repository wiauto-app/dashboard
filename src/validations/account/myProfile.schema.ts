import { z } from "zod";

export const myProfileSchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es obligatorio." })
    .max(40, { error: "El nombre admite como máximo 40 caracteres." }),
  last_name: z
    .string()
    .max(40, { error: "Los apellidos admiten como máximo 40 caracteres." })
    .optional(),
  avatar_url: z.string().optional(),
});

export type MyProfileSchema = z.infer<typeof myProfileSchema>;
