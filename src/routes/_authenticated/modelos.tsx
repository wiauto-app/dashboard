import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogModelItem } from "@/components/vehicles/types/catalog.types";
import { modelsColumns } from "@/components/vehicles/columns/modelsColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { modelsActions } from "@/components/vehicles/actions/modelsActions";
import { modelService } from "@/components/vehicles/services/modelService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/modelos")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    modelService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogModelItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/modelos");

  return (
    <DynamicTable
      table_id="models_catalog"
      columns={modelsColumns}
      data={rows}
      title="Modelos"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => modelsActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={modelsColumns}
          findOneService={modelService.findOne}
          createService={(payload) =>
            modelService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            modelService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Modelo creado correctamente",
            update_success: "Modelo actualizado correctamente",
            create_error: "Error al crear el modelo",
            update_error: "Error al actualizar el modelo",
          }}
        />
      }
    />
  );
}
