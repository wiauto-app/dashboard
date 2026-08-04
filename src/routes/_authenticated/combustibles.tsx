import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogFuelTypeItem } from "@/components/vehicles/types/catalog.types";
import { fuelTypesColumns } from "@/components/vehicles/columns/fuelTypesColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { fuelTypesActions } from "@/components/vehicles/actions/fuelTypesActions";
import { fuelTypesService } from "@/components/vehicles/services/fuelTypesService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/combustibles")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    fuelTypesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogFuelTypeItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/combustibles");

  return (
    <DynamicTable
      table_id="fuel_types_catalog"
      columns={fuelTypesColumns}
      data={rows}
      title="Combustibles"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => fuelTypesActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={fuelTypesColumns}
          findOneService={fuelTypesService.findOne}
          createService={(payload) =>
            fuelTypesService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            fuelTypesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Combustible creado correctamente",
            update_success: "Combustible actualizado correctamente",
            create_error: "Error al crear el combustible",
            update_error: "Error al actualizar el combustible",
          }}
        />
      }
    />
  );
}
