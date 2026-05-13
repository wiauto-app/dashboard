import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es obligatorio." })
    .max(40, { error: "El nombre admite como máximo 40 caracteres." }),
  last_name: z
    .string()
    .min(1, { error: "Los apellidos son obligatorios." })
    .max(40, { error: "Los apellidos admiten como máximo 40 caracteres." }),
  email: z.email({ error: "Introduce un correo electrónico válido." }),
  password: z.string().min(8, {
    error: "La contraseña debe tener al menos 8 caracteres.",
  }),
  role_id: z.uuid({ error: "Selecciona un rol válido." }),
});

export type UserSchema = z.infer<typeof userSchema>;
