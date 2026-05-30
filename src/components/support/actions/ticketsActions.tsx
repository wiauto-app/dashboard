import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import type { TicketListItem } from "../types/ticket.types";
import { ticketsService } from "../services/ticketsService";

export const ticketsActions = (
  row: TicketListItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: ticketsService.delete,
    title: "Eliminar ticket",
    description: `¿Eliminar el ticket «${row.title}»? Esta acción no se puede deshacer.`,
    successToast: "Ticket eliminado correctamente",
    errorToast: "Error al eliminar el ticket",
  }),
];
