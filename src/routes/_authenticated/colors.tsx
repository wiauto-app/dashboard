import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { ColorCatalogItem } from "@/components/vehicles/types/catalog.types";
import { colorsColumns } from "@/components/vehicles/columns/colorsColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { colorsActions } from "@/components/vehicles/actions/colorsActions";
import { colorsService } from "@/components/vehicles/services/colorsService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/colors")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    colorsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<ColorCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/colors");

  return (
    <DynamicTable
      table_id="colors_catalog"
      columns={colorsColumns}
      data={rows}
      title="Colores"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => colorsActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={colorsColumns}
          findOneService={colorsService.findOne}
          createService={(payload) =>
            colorsService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            colorsService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Color creado correctamente",
            update_success: "Color actualizado correctamente",
            create_error: "Error al crear el color",
            update_error: "Error al actualizar el color",
          }}
        />
      }
    />
  );
}
