import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { provincesColumns } from "@/components/locations/columns/provincesColumns";
import type { ProvinceCatalogItem } from "@/components/locations/types/location.types";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import { provincesService } from "@/components/vehicles/services/provincesService";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/provinces")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    provincesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<ProvinceCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/provinces");

  return (
    <DynamicTable
      table_id="provinces_catalog"
      columns={provincesColumns}
      data={rows}
      title="Provincias"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      form={
        <DefaultForm
          columns={provincesColumns}
          findOneService={provincesService.findOne}
          createService={() =>
            Promise.reject(new Error("Creación no permitida"))
          }
          updateService={(id, payload) =>
            provincesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            update_success: "Provincia actualizada correctamente",
            update_error: "Error al actualizar la provincia",
          }}
        />
      }
    />
  );
}
