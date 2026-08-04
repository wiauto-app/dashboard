import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { CatalogYearItem } from "@/components/vehicles/types/catalog.types";
import { yearsColumns } from "@/components/vehicles/columns/yearsColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { yearsActions } from "@/components/vehicles/actions/yearsActions";
import { yearsService } from "@/components/vehicles/services/yearsService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/anos")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    yearsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CatalogYearItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/anos");

  return (
    <DynamicTable
      table_id="years_catalog"
      columns={yearsColumns}
      data={rows}
      title="Años"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => yearsActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={yearsColumns}
          findOneService={yearsService.findOne}
          createService={(payload) =>
            yearsService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            yearsService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Año creado correctamente",
            update_success: "Año actualizado correctamente",
            create_error: "Error al crear el año",
            update_error: "Error al actualizar el año",
          }}
        />
      }
    />
  );
}
