import type { TicketStatus } from "../types/ticket.types";

export const TICKET_FILTER_ALL_VALUE = "__all__";
export const TICKET_FILTER_ALL_LABEL = "Todos";

export const TICKET_STATUS_OPTIONS: {
  value: TicketStatus;
  label: string;
}[] = [
  { value: "open", label: "Abierto" },
  { value: "closed", label: "Cerrado" },
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "resolved", label: "Resuelto" },
  { value: "cancelled", label: "Cancelado" },
];
