import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { WarrantyTypeCatalogItem } from "@/components/vehicles/types/catalog.types";
import { warrantyTypesColumns } from "@/components/vehicles/columns/warrantyTypesColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { warrantyTypesActions } from "@/components/vehicles/actions/warrantyTypesActions";
import { warrantyTypesService } from "@/components/vehicles/services/warrantyTypesService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/warranty-types")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    warrantyTypesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data =
    Route.useLoaderData() as PaginatedResult<WarrantyTypeCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/warranty-types");

  return (
    <DynamicTable
      table_id="warranty_types"
      columns={warrantyTypesColumns}
      data={rows}
      title="Tipos de garantía"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => warrantyTypesActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={warrantyTypesColumns}
          findOneService={warrantyTypesService.findOne}
          createService={(payload) =>
            warrantyTypesService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            warrantyTypesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Tipo de garantía creado correctamente",
            update_success: "Tipo de garantía actualizado correctamente",
            create_error: "Error al crear el tipo de garantía",
            update_error: "Error al actualizar el tipo de garantía",
          }}
        />
      }
    />
  );
}
