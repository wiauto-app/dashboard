import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { ticketsActions } from "@/components/support/actions/ticketsActions";
import { ticketsColumns } from "@/components/support/columns/ticketsColumns";
import { TicketsFilter } from "@/components/support/filters/ticketsFilters";
import { TicketForm } from "@/components/support/forms/ticketForm";
import {
  ticketsParamsSchema,
  type TicketsParams,
} from "@/components/support/schemas/tickets-params.schema";
import { ticketsService } from "@/components/support/services/ticketsService";
import type { TicketListItem } from "@/components/support/types/ticket.types";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/tickets")({
  component: RouteComponent,
  validateSearch: ticketsParamsSchema,
  loader: async ({ deps }: { deps: TicketsParams }) =>
    ticketsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<TicketListItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/tickets");
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  return (
    <DynamicTable
      table_id="tickets"
      columns={ticketsColumns}
      data={rows}
      title="Tickets"
      route={Route}
      total={data?.total ?? 0}
      filters={<TicketsFilter />}
      form={
        <TicketForm
          key={selectedId ?? "create"}
          onSuccess={invalidateData}
        />
      }
      form_size="2xl"
      actions={(row) => ticketsActions(row, invalidateData)}
    />
  );
}
