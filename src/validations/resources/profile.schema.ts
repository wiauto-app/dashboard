import z from "zod";


export const profileSchema = z.object({
  name: z
    .string()
    .min(1, { error: "El nombre es obligatorio." })
    .max(40, { error: "El nombre admite como máximo 40 caracteres." }),
  last_name: z
    .string()
    .min(1, { error: "Los apellidos son obligatorios." })
    .max(40, { error: "Los apellidos admiten como máximo 40 caracteres." }),
  role_id: z.uuid({ error: "Selecciona un rol válido." }),
  avatar_url: z.string().optional(),
  image_url: z.string().optional(),
})

export type ProfileSchema = z.infer<typeof profileSchema>;