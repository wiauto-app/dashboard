import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogItemWithSlug } from "@/components/vehicles/types/catalog.types";
import { vehicleTypesColumns } from "@/components/vehicles/columns/vehicleTypesColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { vehicleTypesActions } from "@/components/vehicles/actions/vehicleTypesActions";
import { vehicleTypesService } from "@/components/vehicles/services/vehicleTypesService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/vehicle-types")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    vehicleTypesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogItemWithSlug>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/vehicle-types");

  return (
    <DynamicTable
      table_id="vehicle_types"
      columns={vehicleTypesColumns}
      data={rows}
      title="Tipos de vehículo"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => vehicleTypesActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={vehicleTypesColumns}
          findOneService={vehicleTypesService.findOne}
          createService={(payload) =>
            vehicleTypesService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            vehicleTypesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Tipo de vehículo creado correctamente",
            update_success: "Tipo de vehículo actualizado correctamente",
            create_error: "Error al crear el tipo de vehículo",
            update_error: "Error al actualizar el tipo de vehículo",
          }}
        />
      }
    />
  );
}
