import { z } from "zod";

export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, {
    error: "La contraseña actual es obligatoria.",
  }),
  password: z.string().min(8, {
    error: "La contraseña debe tener al menos 8 caracteres.",
  }),
});

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;
