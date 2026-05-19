import { z } from "zod";

export const userSchema = z.object({
  email: z.email({ error: "Introduce un correo electrónico válido." }),
  password: z.string().min(8, {
    error: "La contraseña debe tener al menos 8 caracteres.",
  }),

});

export const updateUserSchema = z.object({
  email: z.email({ error: "Introduce un correo electrónico válido." }),
  password: z.string().optional(),

});
export type UserSchema = z.infer<typeof userSchema>;
