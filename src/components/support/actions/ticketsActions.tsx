import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import type { DynamicTableAction } from "@/components/dynamic-table/types";
import { InvestigationChatButton } from "@/components/moderation/InvestigationChatButton";
import type { TicketListItem } from "../types/ticket.types";
import { ticketsService } from "../services/ticketsService";

export const ticketsActions = (
  row: TicketListItem,
  onSuccess?: () => void,
): DynamicTableAction[] => [
  {
    key: "chat-user",
    label: "Chat con usuario",
    component: (
      <InvestigationChatButton
        key={`ticket-chat-${row.id}`}
        profile_id={row.profile_id}
        label="Chat con usuario del ticket"
        tooltip="Usuario no disponible"
        variant="reporter"
      />
    ),
  },
  deleteRowAction(row.id, onSuccess, {
    deleteFn: ticketsService.delete,
    title: "Eliminar ticket",
    description: `¿Eliminar el ticket «${row.title}»? Esta acción no se puede deshacer.`,
    successToast: "Ticket eliminado correctamente",
    errorToast: "Error al eliminar el ticket",
  }),
];
