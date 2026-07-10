import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { makesColumns } from "@/components/vehicles/columns/makesColumns";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import { makesService } from "@/components/vehicles/services/makesService";
import type { CatalogMakeItem } from "@/components/vehicles/types/catalog.types";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/marcas")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    makesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogMakeItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/marcas");

  return (
    <DynamicTable
      table_id="makes_catalog"
      columns={makesColumns}
      data={rows}
      title="Marcas"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      form={
        <DefaultForm
          columns={makesColumns}
          findOneService={makesService.findOne}
          createService={() =>
            Promise.reject(new Error("Creación no permitida"))
          }
          updateService={(id, payload) =>
            makesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            update_success: "Marca actualizada correctamente",
            update_error: "Error al actualizar la marca",
          }}
        />
      }
    />
  );
}
