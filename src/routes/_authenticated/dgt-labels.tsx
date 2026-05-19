import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { DgtLabelCatalogItem } from "@/components/vehicles/types/catalog.types";
import { dgtLabelsColumns } from "@/components/vehicles/columns/dgtLabelsColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { dgtLabelsActions } from "@/components/vehicles/actions/dgtLabelsActions";
import { dgtLabelsService } from "@/components/vehicles/services/dgtLabelsService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/dgt-labels")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    dgtLabelsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<DgtLabelCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/dgt-labels");

  return (
    <DynamicTable
      table_id="dgt_labels"
      columns={dgtLabelsColumns}
      data={rows}
      title="Etiquetas DGT"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => dgtLabelsActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={dgtLabelsColumns}
          findOneService={dgtLabelsService.findOne}
          createService={(payload) =>
            dgtLabelsService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            dgtLabelsService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Etiqueta DGT creada correctamente",
            update_success: "Etiqueta DGT actualizada correctamente",
            create_error: "Error al crear la etiqueta DGT",
            update_error: "Error al actualizar la etiqueta DGT",
          }}
        />
      }
    />
  );
}
