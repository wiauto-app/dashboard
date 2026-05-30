import { z } from "zod";

export const createTicketCategorySchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
});

export const updateTicketCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }).optional(),
});
