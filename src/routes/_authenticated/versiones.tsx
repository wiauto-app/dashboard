import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogVersionItem } from "@/components/vehicles/types/catalog.types";
import { versionsColumns } from "@/components/vehicles/columns/versionsColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { versionsActions } from "@/components/vehicles/actions/versionsActions";
import { catalogVersionsService } from "@/components/vehicles/services/catalogVersionsService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/versiones")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    catalogVersionsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogVersionItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/versiones");

  return (
    <DynamicTable
      table_id="versions_catalog"
      columns={versionsColumns}
      data={rows}
      title="Versiones"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => versionsActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={versionsColumns}
          findOneService={catalogVersionsService.findOne}
          createService={(payload) =>
            catalogVersionsService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            catalogVersionsService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Versión creada correctamente",
            update_success: "Versión actualizada correctamente",
            create_error: "Error al crear la versión",
            update_error: "Error al actualizar la versión",
          }}
        />
      }
    />
  );
}
