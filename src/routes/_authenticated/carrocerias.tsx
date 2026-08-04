import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogBodyTypeItem } from "@/components/vehicles/types/catalog.types";
import { bodyTypesColumns } from "@/components/vehicles/columns/bodyTypesColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { bodyTypesActions } from "@/components/vehicles/actions/bodyTypesActions";
import { bodyTypesService } from "@/components/vehicles/services/bodyTypesService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/carrocerias")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    bodyTypesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogBodyTypeItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/carrocerias");

  return (
    <DynamicTable
      table_id="body_types_catalog"
      columns={bodyTypesColumns}
      data={rows}
      title="Carrocerías"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => bodyTypesActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={bodyTypesColumns}
          findOneService={bodyTypesService.findOne}
          createService={(payload) =>
            bodyTypesService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            bodyTypesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Carrocería creada correctamente",
            update_success: "Carrocería actualizada correctamente",
            create_error: "Error al crear la carrocería",
            update_error: "Error al actualizar la carrocería",
          }}
        />
      }
    />
  );
}
