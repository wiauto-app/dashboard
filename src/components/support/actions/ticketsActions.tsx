import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import type { DynamicTableAction } from "@/components/dynamic-table/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import type { TicketListItem } from "../types/ticket.types";
import { ticketsService } from "../services/ticketsService";

const TicketSupportChatButton = ({ ticket }: { ticket: TicketListItem }) => {
  const navigate = useNavigate();
  const [is_loading, set_is_loading] = useState(false);

  const handleClick = async () => {
    set_is_loading(true);
    try {
      let chat_id = ticket.chat_id;
      if (!chat_id) {
        const response = await ticketsService.ensureChat(ticket.id);
        if (!response.ok || !response.data.chat_id) {
          throw new Error(response.message || "No se pudo crear el chat");
        }
        chat_id = response.data.chat_id;
      }
      await navigate({
        to: "/messages",
        search: { chat_id },
      });
      toast.success("Chat de soporte abierto");
    } catch {
      toast.error("No se pudo abrir el chat del ticket");
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Abrir chat del ticket"
            disabled={is_loading}
            onClick={handleClick}
          >
            <MessageCircle className="size-4" aria-hidden />
          </Button>
        }
      />
      <TooltipContent>Abrir chat de soporte del ticket</TooltipContent>
    </Tooltip>
  );
};

export const ticketsActions = (
  row: TicketListItem,
  onSuccess?: () => void,
): DynamicTableAction[] => [
  {
    key: "chat-ticket",
    label: "Chat del ticket",
    component: (
      <TicketSupportChatButton key={`ticket-chat-${row.id}`} ticket={row} />
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
