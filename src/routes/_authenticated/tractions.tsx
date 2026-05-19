import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogItemWithSlug } from "@/components/vehicles/types/catalog.types";
import { tractionsColumns } from "@/components/vehicles/columns/tractionsColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { tractionsActions } from "@/components/vehicles/actions/tractionsActions";
import { tractionsService } from "@/components/vehicles/services/tractionsService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/tractions")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    tractionsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogItemWithSlug>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/tractions");

  return (
    <DynamicTable
      table_id="tractions"
      columns={tractionsColumns}
      data={rows}
      title="Tracciones"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => tractionsActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={tractionsColumns}
          findOneService={tractionsService.findOne}
          createService={(payload) =>
            tractionsService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            tractionsService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Tracción creada correctamente",
            update_success: "Tracción actualizada correctamente",
            create_error: "Error al crear la tracción",
            update_error: "Error al actualizar la tracción",
          }}
        />
      }
    />
  );
}
