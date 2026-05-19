import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { VehicleServiceCatalogItem } from "@/components/vehicles/types/catalog.types";
import { catalogServicesColumns } from "@/components/vehicles/columns/catalogServicesColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { catalogServicesActions } from "@/components/vehicles/actions/catalogServicesActions";
import { catalogServicesService } from "@/components/vehicles/services/catalogServicesService";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/catalog-services")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    catalogServicesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data =
    Route.useLoaderData() as PaginatedResult<VehicleServiceCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/catalog-services");

  return (
    <DynamicTable
      table_id="catalog_services"
      columns={catalogServicesColumns}
      data={rows}
      title="Servicios de anuncio"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => catalogServicesActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={catalogServicesColumns}
          findOneService={catalogServicesService.findOne}
          createService={(payload) =>
            catalogServicesService.create(payload as Record<string, unknown>)
          }
          updateService={(id, payload) =>
            catalogServicesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Servicio creado correctamente",
            update_success: "Servicio actualizado correctamente",
            create_error: "Error al crear el servicio",
            update_error: "Error al actualizar el servicio",
          }}
        />
      }
    />
  );
}
