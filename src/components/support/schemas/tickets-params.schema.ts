import z from "zod";
import { paginationParamsSchema } from "@/validations/queryParams/pagination-params.schema";
import type { TicketStatus } from "../types/ticket.types";

const ticket_status_values = [
  "open",
  "closed",
  "pending",
  "in_progress",
  "resolved",
  "cancelled",
] as const satisfies readonly TicketStatus[];

export const ticketsParamsSchema = z
  .object({
    status: z.enum(ticket_status_values).optional(),
    category_id: z.string().uuid().optional(),
  })
  .extend(paginationParamsSchema.shape);

export type TicketsParams = z.infer<typeof ticketsParamsSchema>;
