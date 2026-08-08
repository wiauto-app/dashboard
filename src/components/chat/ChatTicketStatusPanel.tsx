import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TicketStatusSelector } from "@/components/dynamicSelectors/ticketStatusSelector";
import { TICKET_STATUS_OPTIONS } from "@/components/support/constants/ticket-status.constants";
import { ticketsService } from "@/components/support/services/ticketsService";
import type { TicketStatus } from "@/components/support/types/ticket.types";

import type { ChatTicketSummary } from "./types/chat.types";

interface ChatTicketStatusPanelProps {
  ticket: ChatTicketSummary;
}

export const ChatTicketStatusPanel = ({
  ticket,
}: ChatTicketStatusPanelProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (status: TicketStatus) => {
      const response = await ticketsService.update(ticket.id, { status });
      if (!response.ok) {
        throw new Error(response.message || "No se pudo actualizar el estado");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Estado del ticket actualizado");
      void queryClient.invalidateQueries({ queryKey: ["chat-list"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const status_label =
    TICKET_STATUS_OPTIONS.find((option) => option.value === ticket.status)
      ?.label ?? ticket.status;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-blue-100 bg-blue-50/40 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
          Ticket de soporte
        </p>
        <p className="truncate text-sm font-semibold">{ticket.title}</p>
        <p className="text-xs text-muted-foreground">Estado: {status_label}</p>
      </div>
      <div className="w-[12rem]">
        <TicketStatusSelector
          value={ticket.status}
          disabled={mutation.isPending}
          placeholder="Cambiar estado"
          onValueChange={(value) => {
            if (!value || value === ticket.status) return;
            mutation.mutate(value as TicketStatus);
          }}
        />
      </div>
    </div>
  );
};
