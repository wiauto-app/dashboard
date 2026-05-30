import { z } from "zod";

const ticket_status_enum = z.enum([
  "open",
  "closed",
  "pending",
  "in_progress",
  "resolved",
  "cancelled",
]);

export const createTicketSchema = z.object({
  category_id: z.string().uuid({ message: "Selecciona una categoría" }),
  title: z.string().min(1, { message: "El título es obligatorio" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  file_url: z.string().optional(),
});

export const updateTicketSchema = createTicketSchema
  .partial()
  .extend({
    status: ticket_status_enum.optional(),
  });
