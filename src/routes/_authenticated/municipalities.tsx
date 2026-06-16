import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { municipalitiesColumns } from "@/components/locations/columns/municipalitiesColumns";
import type { MunicipalityCatalogItem } from "@/components/locations/types/location.types";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import { municipalitiesService } from "@/components/vehicles/services/municipalitiesService";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/municipalities")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    municipalitiesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<MunicipalityCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/municipalities");

  return (
    <DynamicTable
      table_id="municipalities_catalog"
      columns={municipalitiesColumns}
      data={rows}
      title="Municipios"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      form={
        <DefaultForm
          columns={municipalitiesColumns}
          findOneService={municipalitiesService.findOne}
          createService={() =>
            Promise.reject(new Error("Creación no permitida"))
          }
          updateService={(id, payload) =>
            municipalitiesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            update_success: "Municipio actualizado correctamente",
            update_error: "Error al actualizar el municipio",
          }}
        />
      }
    />
  );
}
