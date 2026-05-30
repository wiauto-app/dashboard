import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { ticketCategoriesActions } from "@/components/support/actions/ticketCategoriesActions";
import { ticketCategoriesColumns } from "@/components/support/columns/ticketCategoriesColumns";
import {
  supportCatalogParamsSchema,
  type SupportCatalogParams,
} from "@/components/support/schemas/support-catalog-params.schema";
import { ticketCategoriesService } from "@/components/support/services/ticketCategoriesService";
import type { TicketCategoryItem } from "@/components/support/types/ticket-category.types";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/ticket-categories")({
  component: RouteComponent,
  validateSearch: supportCatalogParamsSchema,
  loader: async ({ deps }: { deps: SupportCatalogParams }) =>
    ticketCategoriesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<TicketCategoryItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/ticket-categories");

  return (
    <DynamicTable
      table_id="ticket-categories"
      columns={ticketCategoriesColumns}
      data={rows}
      title="Categorías de ticket"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => ticketCategoriesActions(row, invalidateData)}
      form={
        <DefaultForm
          columnsLayout={1}
          columns={ticketCategoriesColumns}
          findOneService={ticketCategoriesService.findOne}
          createService={(payload) =>
            ticketCategoriesService.create(payload as { name: string })
          }
          updateService={(id, payload) =>
            ticketCategoriesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Categoría creada correctamente",
            update_success: "Categoría actualizada correctamente",
            create_error: "Error al crear la categoría",
            update_error: "Error al actualizar la categoría",
          }}
        />
      }
    />
  );
}
