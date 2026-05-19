import z from "zod";

export const phoneSchema = z.object({
  phone_code: z.string().min(1, { error: "El prefijo telefónico es obligatorio." }).default("+34"),
  phone: z.string().min(1, { error: "El teléfono es obligatorio." }),
});