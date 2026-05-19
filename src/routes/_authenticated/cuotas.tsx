import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import type { UpdateCuotaDto } from "@/components/vehicles/services/cuotasService";
import { cuotasService } from "@/components/vehicles/services/cuotasService";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { Cuota } from "@/components/vehicles/types/vehicles.types";
import { cuotasColumns } from "@/components/vehicles/columns/cuotasColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { cuotasActions } from "@/components/vehicles/actions/cuotasActions";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/cuotas")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    cuotasService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<Cuota>;
  const cuotas_rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/cuotas");
  return (
    <DynamicTable
      table_id="cuotas"
      columns={cuotasColumns}
      data={cuotas_rows}
      title="Planes de cuotas"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => cuotasActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={cuotasColumns}
          findOneService={cuotasService.findOne}
          createService={(payload) =>
            cuotasService.create(
              payload as { name: string; value: number },
            )
          }
          updateService={(id, payload) =>
            cuotasService.update({
              id,
              ...(payload as Record<string, unknown>),
            } as UpdateCuotaDto)
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Plan de cuotas creado correctamente",
            update_success: "Plan de cuotas actualizado correctamente",
            create_error: "Error al crear el plan de cuotas",
            update_error: "Error al actualizar el plan de cuotas",
          }}
        />
      }
    />
  );
}
